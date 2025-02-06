import PDFDocument from 'pdfkit';
import type { ServiceOrder } from '../../../domain/ServiceOrders/entities/ServiceOrder';
import type { IServiceOrderRepository } from '../../../domain/ServiceOrders/repositories/IServiceOrderRepository';
import type { UserRepository } from '../../../domain/Users/repositories/UserRepository';
import { ServiceOrderReportDTO } from '../dto/ReportDTO';

export class ReportService {
  constructor(
    private serviceOrderRepository: IServiceOrderRepository,
    private userRepository: UserRepository
  ) {}

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

  async generateIndividualReport(orderId: number): Promise<Buffer> {
    try {
      const order = await this.serviceOrderRepository.getById(orderId);
      if (!order) {
        throw new Error('Order not found');
      }

      const reportDTO = await this.orderToReportDTO(order);
      const doc = new PDFDocument();

      return new Promise((resolve, reject) => {
        const chunks: Buffer[] = [];

        doc.on('data', (chunk) => chunks.push(chunk));
        doc.on('end', () => resolve(Buffer.concat(chunks)));
        doc.on('error', (err) => reject(err));

        doc
          .fontSize(20)
          .text('Service Order Report', { align: 'center' })
          .moveDown()
          .fontSize(12)
          .text(`Order ID: ${reportDTO.orderId}`)
          .text(`Description: ${reportDTO.description}`)
          .text(`Status: ${reportDTO.status}`)
          .text(`Scheduled for: ${reportDTO.scheduledAt.toLocaleDateString()}`)
          .moveDown()
          .text(`User: ${reportDTO.userName}`)
          .text(`Email: ${reportDTO.userEmail}`);

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

      const doc = new PDFDocument();

      return new Promise((resolve, reject) => {
        const chunks: Buffer[] = [];

        doc.on('data', (chunk) => chunks.push(chunk));
        doc.on('end', () => resolve(Buffer.concat(chunks)));
        doc.on('error', (err) => reject(err));

        doc
          .fontSize(20)
          .text('Service Orders Report', { align: 'center' })
          .moveDown();

        for (const order of filteredOrders) {
          doc
            .fontSize(14)
            .text(`Order #${order.id}`)
            .fontSize(12)
            .text(`Description: ${order.description}`)
            .text(`Status: ${order.status}`)
            .text(`Scheduled: ${order.scheduledAt.toLocaleDateString()}`)
            .moveDown();
        }

        doc.end();
      });
    } catch (error) {
      console.error('PDF Generation Error:', error);
      throw new Error('Failed to generate PDF report');
    }
  }
}
