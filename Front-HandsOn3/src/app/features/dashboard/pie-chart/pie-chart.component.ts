import { Component, AfterViewInit, ViewChild, ElementRef, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import Chart from 'chart.js/auto';
import { FormsModule } from '@angular/forms';
import { DashboardService } from '../../../services/dashboard.service';
import { Subscription } from 'rxjs';
import { ApiResponse, StatusSummaryData } from '../../../models/api-responses';

@Component({
  selector: 'app-pie-chart',
  standalone: true,
  templateUrl: './pie-chart.component.html',
  styleUrls: ['./pie-chart.component.css'],
  imports: [FormsModule, CommonModule]
})
export class PieChartComponent implements AfterViewInit, OnDestroy {
  @ViewChild('pieChartCanvas') pieChartCanvas!: ElementRef;
  pieChart: any;
  selectedYear: number = new Date().getFullYear();
  
  dataByYear: Record<number, number[]> = {
    2023: [120, 80, 30],
    2024: [150, 90, 40],
    2025: [180, 100, 50]
  };

  yearsList: number[] = [];
  private subscription?: Subscription;
  
  isLoading = true;
  hasError = false;
  errorMessage = '';
  isEmptyData = false;

  constructor(private dashboardService: DashboardService) {
    const currentYear = new Date().getFullYear();
    this.yearsList = [currentYear - 1, currentYear, currentYear + 1];
    this.selectedYear = currentYear;
  }

  ngAfterViewInit() {
    setTimeout(() => {
      this.loadChartData();
    });
  }

  ngOnDestroy() {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
    if (this.pieChart) {
      this.pieChart.destroy();
    }
  }

  private loadChartData() {
    this.isLoading = true;
    this.hasError = false;
    this.isEmptyData = false;
    
    this.subscription = this.dashboardService.getStatusSummary().subscribe({
      next: (response: ApiResponse<Record<string, StatusSummaryData>>) => {
        console.log('Dashboard status summary response:', response);
        this.isLoading = false;
        
        if (!response) {
          this.isEmptyData = true;
          this.errorMessage = 'Não foi possível carregar os dados';
          return;
        }
        
        if (!response.success) {
          this.hasError = true;
          this.errorMessage = response.message || 'Erro ao carregar os dados';
          return;
        }
        
        if (!response.data || Object.keys(response.data).length === 0) {
          this.isEmptyData = true;
          this.errorMessage = 'Não há dados disponíveis para exibição';
          return;
        }

        const statusData = response.data;
        const transformedData: Record<number, number[]> = {};
        const currentYear = new Date().getFullYear();
        
        if (typeof statusData === 'object') {

          const statusValues: StatusSummaryData = Object.values(statusData)[0] || {
            completed: 0,
            scheduled: 0,
            cancelled: 0
          };
          
          transformedData[currentYear] = [
            statusValues.completed || 0,
            statusValues.scheduled || 0,
            statusValues.cancelled || 0
          ];
          
          if (transformedData[currentYear].every(val => val === 0)) {
            this.isEmptyData = true;
            this.errorMessage = 'Não há dados de status para exibição';
            return;
          }
          
          this.yearsList = [currentYear];
          this.selectedYear = currentYear;
          this.dataByYear = transformedData;
          
          this.createChart();
        }
      },
      error: (error) => {
        console.error('Error loading status summary data:', error);
        this.isLoading = false;
        this.hasError = true;
        this.errorMessage = 'Falha ao conectar com o servidor';
      }
    });
  }

  createChart() {
    if (!this.pieChartCanvas) {
      console.error('Chart canvas element not found!');
      return;
    }

    if (this.pieChart) {
      this.pieChart.destroy();
    }

    this.pieChart = new Chart(this.pieChartCanvas.nativeElement, {
      type: 'pie',
      data: {
        labels: ['Concluídos', 'Agendados', 'Cancelados'],
        datasets: [{
          data: this.dataByYear[this.selectedYear] || [0, 0, 0],
          backgroundColor: ['#4CAF50', '#FFA726', '#9E9E9E']
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: true,
        plugins: {
          legend: {
            position: 'bottom',
            labels: { color: 'black' }
          },
          title: {
            display: true,
            text: `Serviços por Status - ${this.selectedYear}`,
            color: 'black',
            font: { size: 16 }
          }
        }
      }
    });
  }

  updateChart() {
    if (this.pieChart) {
      this.pieChart.data.datasets[0].data = this.dataByYear[this.selectedYear] || [0, 0, 0];
      this.pieChart.options.plugins.title.text = `Serviços por Status - ${this.selectedYear}`;
      this.pieChart.update();
    }
  }
  
  retryLoadData() {
    this.loadChartData();
  }
}
