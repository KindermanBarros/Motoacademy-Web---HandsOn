import { Component, AfterViewInit, ViewChild, ElementRef, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import Chart from 'chart.js/auto';
import { FormsModule } from '@angular/forms';
import { DashboardService } from '../../../services/dashboard.service';
import { Subscription } from 'rxjs';
import { ApiResponse, DashboardSummary } from '../../../models/api-responses';

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
  private subscription?: Subscription;

  constructor(private dashboardService: DashboardService) {}

  ngAfterViewInit() {
    this.loadChartData();
  }

  ngOnDestroy() {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
    if (this.barChart) {
      this.barChart.destroy();
    }
  }

  private loadChartData() {
    this.subscription = this.dashboardService.getClientOrdersSummary().subscribe({
      next: (response: ApiResponse<DashboardSummary['clientOrdersSummary']>) => {
        if (!response.success || !response.data) {
          console.error('Failed to load dashboard data');
          return;
        }
        const clientData = response.data;
        const labels = clientData.map(client => client.name);
        const values = clientData.map(client => client.totalOrders);
        
        this.createChart(labels, values);
      },
      error: (error) => {
        console.error('Error loading chart data:', error);
      }
    });
  }

  private createChart(labels: string[], values: number[]) {
    if (this.barChart) {
      this.barChart.destroy();
    }

    this.barChart = new Chart(this.barChartCanvas.nativeElement, {
      type: 'bar',
      data: {
        labels: labels,
        datasets: [{
          label: 'Ordens de Serviço por Cliente',
          data: values,
          backgroundColor: '#4CAF50',
          borderWidth: 1
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'top',
            labels: { color: 'black' }
          },
          title: {
            display: true,
            text: 'Ordens de Serviço por Cliente',
            color: 'black',
            font: { size: 16 }
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            ticks: { color: 'black' }
          },
          x: {
            ticks: { color: 'black' }
          }
        }
      }
    });
  }
}