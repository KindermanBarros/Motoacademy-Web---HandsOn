import { Component, AfterViewInit, ViewChild, ElementRef, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import Chart from 'chart.js/auto';
import { Subscription } from 'rxjs';
import { DashboardService } from '../../../services/dashboard.service';
import { OrdersService } from '../../../services/orders.service';
import { ServiceOrder } from '../../../models/api-responses';

@Component({
  selector: 'app-bar-chart',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './bar-chart.component.html',
  styleUrls: ['./bar-chart.component.css']
})
export class BarChartComponent implements AfterViewInit, OnDestroy {
  @ViewChild('barChartCanvas') barChartCanvas!: ElementRef;
  barChart: any;
  
  selectedYear: number = new Date().getFullYear();
  yearsList: number[] = [];
  
  isLoading = true;
  hasError = false;
  isEmptyData = false;
  errorMessage = '';
  
  private subscription?: Subscription;

  // Month names in Portuguese
  private monthNames = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 
                        'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];
  
  // Data structure to hold orders organized by year > month > status
  private ordersByYearAndMonth: Record<number, Record<number, { completed: number, pending: number, cancelled: number }>> = {};

  constructor(private ordersService: OrdersService) {
    const currentYear = new Date().getFullYear();
    this.yearsList = [currentYear - 1, currentYear, currentYear + 1];
    this.selectedYear = currentYear;
  }

  ngAfterViewInit() {
    setTimeout(() => {
      this.loadOrdersData();
    }, 0);
  }

  ngOnDestroy() {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
    if (this.barChart) {
      this.barChart.destroy();
    }
  }

  loadOrdersData() {
    this.isLoading = true;
    this.hasError = false;
    this.isEmptyData = false;
    
    this.subscription = this.ordersService.getMyOrders().subscribe({
      next: (orders) => {
        console.log('Orders data received:', orders);
        this.isLoading = false;
        
        if (!orders || orders.length === 0) {
          this.isEmptyData = true;
          this.errorMessage = 'Não há ordens de serviço para exibir';
          return;
        }
        
        // Process the orders data by year and month
        this.processOrdersData(orders);
        
        // Check if we have data for the selected year
        if (!this.ordersByYearAndMonth[this.selectedYear] || 
            Object.values(this.ordersByYearAndMonth[this.selectedYear])
              .every(month => month.completed === 0 && month.pending === 0 && month.cancelled === 0)) {
          this.isEmptyData = true;
          this.errorMessage = `Não há dados para o ano ${this.selectedYear}`;
          return;
        }
        
        // Create the chart with the data
        setTimeout(() => {
          this.createChart();
        }, 0);
      },
      error: (error) => {
        console.error('Error loading orders data:', error);
        this.isLoading = false;
        this.hasError = true;
        this.errorMessage = 'Falha ao conectar com o servidor';
      }
    });
  }

  processOrdersData(orders: ServiceOrder[]) {
    // Initialize the data structure
    this.ordersByYearAndMonth = {};
    
    // Populate years
    this.yearsList.forEach(year => {
      this.ordersByYearAndMonth[year] = {};
      
      // Initialize all months for this year
      for (let month = 0; month < 12; month++) {
        this.ordersByYearAndMonth[year][month] = {
          completed: 0,
          pending: 0,
          cancelled: 0
        };
      }
    });
    
    // Process each order
    orders.forEach(order => {
      const orderDate = new Date(order.scheduledAt);
      const year = orderDate.getFullYear();
      const month = orderDate.getMonth(); // 0-based (January = 0)
      
      // Only process if the year is in our tracked years
      if (this.ordersByYearAndMonth[year]) {
        // Make sure the month bucket exists
        if (!this.ordersByYearAndMonth[year][month]) {
          this.ordersByYearAndMonth[year][month] = {
            completed: 0,
            pending: 0,
            cancelled: 0
          };
        }
        
        // Increment the appropriate status counter
        if (order.status === 'completed') {
          this.ordersByYearAndMonth[year][month].completed++;
        } else if (order.status === 'pending') {
          this.ordersByYearAndMonth[year][month].pending++;
        } else if (order.status === 'cancelled') {
          this.ordersByYearAndMonth[year][month].cancelled++;
        }
      }
    });
    
    console.log('Processed orders by year and month:', this.ordersByYearAndMonth);
  }

  createChart() {
    if (!this.barChartCanvas) {
      console.error('Chart canvas element not found!');
      return;
    }

    const canvas = this.barChartCanvas.nativeElement;
    if (!canvas) {
      console.error('Canvas element is null!');
      return;
    }

    if (this.barChart) {
      this.barChart.destroy();
    }

    const yearData = this.ordersByYearAndMonth[this.selectedYear] || {};
    
    // Prepare chart data
    const completedData = Array(12).fill(0);
    const pendingData = Array(12).fill(0);
    const cancelledData = Array(12).fill(0);
    
    // Fill in the data we have
    for (let i = 0; i < 12; i++) {
      if (yearData[i]) {
        completedData[i] = yearData[i].completed;
        pendingData[i] = yearData[i].pending;
        cancelledData[i] = yearData[i].cancelled;
      }
    }

    try {
      this.barChart = new Chart(canvas, {
        type: 'bar',
        data: {
          labels: this.monthNames,
          datasets: [
            { 
              label: 'Concluídos', 
              data: completedData, 
              backgroundColor: '#4CAF50' 
            },
            { 
              label: 'Agendados', 
              data: pendingData, 
              backgroundColor: '#FFA726' 
            },
            { 
              label: 'Cancelados', 
              data: cancelledData, 
              backgroundColor: '#9E9E9E' 
            }
          ]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            title: {
              display: true,
              text: `Ordens de Serviço por Mês - ${this.selectedYear}`,
              color: 'black',
              font: { size: 16 }
            },
            legend: {
              position: 'bottom',
              labels: { color: 'black' }
            }
          },
          scales: {
            x: {
              title: {
                display: true,
                text: 'Meses',
                color: 'black',
                font: { size: 14 }
              },
              ticks: { color: 'black' }
            },
            y: {
              title: {
                display: true,
                text: 'Quantidade',
                color: 'black',
                font: { size: 14 }
              },
              ticks: { color: 'black' },
              beginAtZero: true
            }
          }
        }
      });
    } catch (error) {
      console.error('Error creating chart:', error);
    }
  }

  updateChart() {
    if (this.barChart) {
      // Check if we have data for the selected year
      if (!this.ordersByYearAndMonth[this.selectedYear] || 
          Object.values(this.ordersByYearAndMonth[this.selectedYear])
            .every(month => month.completed === 0 && month.pending === 0 && month.cancelled === 0)) {
        this.isEmptyData = true;
        this.errorMessage = `Não há dados para o ano ${this.selectedYear}`;
        return;
      } else {
        this.isEmptyData = false;
      }
      
      const yearData = this.ordersByYearAndMonth[this.selectedYear] || {};
      
      // Update each dataset
      for (let i = 0; i < 12; i++) {
        if (yearData[i]) {
          this.barChart.data.datasets[0].data[i] = yearData[i].completed;
          this.barChart.data.datasets[1].data[i] = yearData[i].pending;
          this.barChart.data.datasets[2].data[i] = yearData[i].cancelled;
        } else {
          this.barChart.data.datasets[0].data[i] = 0;
          this.barChart.data.datasets[1].data[i] = 0;
          this.barChart.data.datasets[2].data[i] = 0;
        }
      }
      
      this.barChart.options.plugins.title.text = `Ordens de Serviço por Mês - ${this.selectedYear}`;
      this.barChart.update();
    }
  }
  
  retryLoadData() {
    this.loadOrdersData();
  }
}