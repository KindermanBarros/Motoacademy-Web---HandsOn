import { Component, AfterViewInit, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import Chart from 'chart.js/auto';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-pie-chart',
  standalone: true,
  templateUrl: './pie-chart.component.html',
  styleUrls: ['./pie-chart.component.css'],
  imports: [FormsModule, CommonModule]
})
export class PieChartComponent implements AfterViewInit {
  @ViewChild('pieChartCanvas') pieChartCanvas!: ElementRef;
  pieChart: any;
  selectedYear: number = 2025;

  dataByYear: Record<number, number[]> = {
    2023: [120, 80, 30],
    2024: [150, 90, 40],
    2025: [180, 100, 50]
  };

  yearsList: number[] = [];

  constructor() {
    this.yearsList = Object.keys(this.dataByYear).map(year => Number(year));
  }

  ngAfterViewInit() {
    this.createChart();
  }

  createChart() {
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
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'right',
            labels: { color: 'black' }
          },
          title: {
            display: true,
            text: `Serviços Concluídos`,
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
      this.pieChart.update();
    }
  }
}
