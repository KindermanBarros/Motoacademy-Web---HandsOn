import PDFDocument from 'pdfkit';
import type { ServiceOrder } from '../../../domain/ServiceOrders/entities/ServiceOrder';
import type { IServiceOrderRepository } from '../../../domain/ServiceOrders/repositories/IServiceOrderRepository';
import type { IUserRepository } from '../../../domain/Users/repositories/UserRepository';
import { ServiceOrderReportDTO } from '../dto/ReportDTO';

export class ReportService {
  constructor(
    private serviceOrderRepository: IServiceOrderRepository,
    private userRepository: IUserRepository
  ) { }

  private async orderToReportDTO(
    order: ServiceOrder
  ): Promise<ServiceOrderReportDTO> {
    const user = await this.userRepository.getById(order.userId);
    if (!user) {
      throw new Error('User not found');
    }

    return new ServiceOrderReportDTO(
      order.id,
      order.description,
      order.status,
      order.scheduledAt,
      user.name,
      user.email
    );
  }

  private setupDocument(doc: PDFKit.PDFDocument, title: string): void {

    doc.info.Title = title;
    doc.info.Author = 'MotoAcademy Service System';

    doc.rect(0, 0, doc.page.width, 80)
      .fill('#0066cc');

    doc.fontSize(24)
      .fillColor('white')
      .text('Ordem Express', 50, 30, { align: 'left' });

    doc.fontSize(20)
      .fillColor('black')
      .text(title, 50, 120, { align: 'center' })
      .moveDown();

    const now = new Date();
    doc.fontSize(10)
      .fillColor('#666666')
      .text(`Generated on: ${now.toLocaleDateString()} at ${now.toLocaleTimeString()}`,
        { align: 'right' })
      .moveDown(3);
  }

  private getStatusColor(status: string): string {
    switch (status.toLowerCase()) {
      case 'pending': return '#ff9900';
      case 'in_progress': return '#0066cc';
      case 'completed': return '#00cc66';
      case 'cancelled': return '#cc0000';
      default: return '#666666';
    }
  }

  private formatStatus(status: string): string {
    return status.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
  }

  private addPageNumbers(doc: PDFKit.PDFDocument): void {
    const totalPages = doc.bufferedPageRange().count;

    for (let i = 0; i < totalPages; i++) {
      doc.switchToPage(i);

      doc.fontSize(10)
        .fillColor('#666666')
        .text(
          `Page ${i + 1} of ${totalPages}`,
          50,
          doc.page.height - 50,
          { align: 'center' }
        );
    }
  }

  async generateIndividualReport(orderId: number): Promise<Buffer> {
    try {
      const order = await this.serviceOrderRepository.getById(orderId);
      if (!order) {
        throw new Error('Order not found');
      }

      const reportDTO = await this.orderToReportDTO(order);
      const doc = new PDFDocument({ margin: 50 });

      return new Promise((resolve, reject) => {
        const chunks: Buffer[] = [];

        doc.on('data', (chunk) => chunks.push(chunk));
        doc.on('end', () => resolve(Buffer.concat(chunks)));
        doc.on('error', (err) => reject(err));

        this.setupDocument(doc, 'Service Order Report');

        doc.rect(50, doc.y, doc.page.width - 100, 3)
          .fill('#0066cc');

        doc.moveDown(0.8);

        doc.fontSize(16)
          .fillColor('#0066cc')
          .text('Order Information', { underline: true })
          .moveDown(1);

        doc.fontSize(12)
          .fillColor('#333333')
          .text(`Order ID: `, { continued: true })
          .fillColor('#0066cc')
          .text(`${reportDTO.id}`)
          .moveDown(0.8);

        doc.fontSize(12)
          .fillColor('#333333')
          .text(`Description: `, { continued: true })
          .fillColor('#000000')
          .text(`${reportDTO.description}`)
          .moveDown(0.8);

        doc.fontSize(12)
          .fillColor('#333333')
          .text(`Status: `, { continued: true })
          .fillColor(this.getStatusColor(reportDTO.status))
          .text(this.formatStatus(reportDTO.status))
          .moveDown(0.8);

        doc.fontSize(12)
          .fillColor('#333333')
          .text(`Scheduled for: `, { continued: true })
          .fillColor('#000000')
          .text(`${reportDTO.scheduledAt.toLocaleDateString()} at ${reportDTO.scheduledAt.toLocaleTimeString()}`)
          .moveDown(2);

        doc.moveDown(1);

        doc.rect(50, doc.y, doc.page.width - 100, 3)
          .fill('#0066cc');

        doc.moveDown(0.8);

        doc.fontSize(16)
          .fillColor('#0066cc')
          .text('Customer Information', { underline: true })
          .moveDown(1);

        doc.fontSize(12)
          .fillColor('#333333')
          .text(`Name: `, { continued: true })
          .fillColor('#000000')
          .text(`${reportDTO.userName}`)
          .moveDown(0.8);

        doc.fontSize(12)
          .fillColor('#333333')
          .text(`Email: `, { continued: true })
          .fillColor('#000000')
          .text(`${reportDTO.userEmail}`)
          .moveDown(2);

        doc.fontSize(10)
          .fillColor('#666666')
          .text('This is an automatically generated report.',
            { align: 'center' });

        doc.end();
      });
    } catch (error) {
      console.error('PDF Generation Error:', error);
      throw new Error('Failed to generate PDF report');
    }
  }

  async generateFilteredReport(filter: { status?: string }): Promise<Buffer> {
    try {
      const orders = await this.serviceOrderRepository.getAll();
      const filteredOrders = orders.filter(
        (order) => !filter.status || order.status === filter.status
      );

      const doc = new PDFDocument({ margin: 50 });

      return new Promise((resolve, reject) => {
        const chunks: Buffer[] = [];

        doc.on('data', (chunk) => chunks.push(chunk));
        doc.on('end', () => resolve(Buffer.concat(chunks)));
        doc.on('error', (err) => reject(err));

        // Setup document with styling
        this.setupDocument(doc, 'Service Orders Report');

        // Add filter information
        if (filter.status) {
          doc.fontSize(12)
            .fillColor(this.getStatusColor(filter.status))
            .text(`Filtered by status: ${this.formatStatus(filter.status)}`, { align: 'center' })
            .moveDown(1.5);
        }

        // Summary info
        doc.fontSize(12)
          .fillColor('#333333')
          .text(`Total orders: ${filteredOrders.length}`, { align: 'left' })
          .moveDown(2);

        const tableTop = doc.y;
        const tableHeaders = ['ID', 'Description', 'Status', 'Scheduled Date'];
        const columnWidth = (doc.page.width - 100) / tableHeaders.length;

        doc.rect(50, tableTop, doc.page.width - 100, 35)
          .fill('#0066cc');

        doc.fillColor('white');
        tableHeaders.forEach((header, i) => {
          doc.text(
            header,
            50 + (columnWidth * i),
            tableTop + 12,
            { width: columnWidth, align: 'center' }
          );
        });

        let rowY = tableTop + 35;

        for (let i = 0; i < filteredOrders.length; i++) {
          const order = filteredOrders[i];

          if (i % 2 === 0) {
            doc.rect(50, rowY, doc.page.width - 100, 40)
              .fill('#f5f5f5');
          }

          if (rowY > doc.page.height - 100) {
            doc.addPage();
            rowY = 70;

            doc.rect(50, rowY, doc.page.width - 100, 35)
              .fill('#0066cc');

            doc.fillColor('white');
            tableHeaders.forEach((header, i) => {
              doc.text(
                header,
                50 + (columnWidth * i),
                rowY + 12,
                { width: columnWidth, align: 'center' }
              );
            });

            rowY += 35;
          }

          doc.fillColor('#333333')
            .text(
              `${order.id}`,
              50,
              rowY + 15,
              { width: columnWidth, align: 'center' }
            );

          doc.text(
            order.description.length > 20
              ? order.description.substring(0, 20) + '...'
              : order.description,
            50 + columnWidth,
            rowY + 15,
            { width: columnWidth, align: 'center' }
          );

          doc.fillColor(this.getStatusColor(order.status))
            .text(
              this.formatStatus(order.status),
              50 + (columnWidth * 2),
              rowY + 15,
              { width: columnWidth, align: 'center' }
            );

          doc.fillColor('#333333')
            .text(
              `${order.scheduledAt.toLocaleDateString()}`,
              50 + (columnWidth * 3),
              rowY + 15,
              { width: columnWidth, align: 'center' }
            );

          rowY += 40;
        }

        doc.end();
      });
    } catch (error) {
      console.error('PDF Generation Error:', error);
      throw new Error('Failed to generate PDF report');
    }
  }
}
