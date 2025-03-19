import { Component, AfterViewInit, ViewChild, ElementRef } from '@angular/core';
import Chart from 'chart.js/auto';

@Component({
  selector: 'app-bar-chart',
  standalone: true,
  templateUrl: './bar-chart.component.html',
  styleUrls: ['./bar-chart.component.css']
})
export class BarChartComponent implements AfterViewInit {
  @ViewChild('barChartCanvas') barChartCanvas!: ElementRef;
  barChart: any;

  ngAfterViewInit() {
    this.createChart();
  }

  createChart() {
    this.barChart = new Chart(this.barChartCanvas.nativeElement, {
      type: 'bar',
      data: {
        labels: ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio','Junho', 'Julho', 'Agosto','Setembro','Outubro','Novembro','Dezembro'], 
        datasets: [
          { label: 'Concluídos', data: [50, 75, 80, 90, 100, 500, 100, 0], backgroundColor: '#4CAF50' },
          { label: 'Agendados', data: [30, 40, 50, 60, 70, 100, 100, 0], backgroundColor: '#FFA726' },
          { label: 'Cancelados', data: [10, 15, 20, 25, 30, 100, 100, 0], backgroundColor: '#9E9E9E' }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          title: {
            display: true,
            text: 'Gráfico de Agendamentos', // Título geral do gráfico
            color: 'black',
            font: { size: 16 }
          }
        },
        scales: {
          x: {
            title: {
              display: true,
              text: 'Meses', // 🔹 Nome do eixo X
              color: 'black',
              font: { size: 14 }
            },
            ticks: { color: 'black' },
            grid: { color: 'rgba(255, 255, 255, 0.2)' }
          },
          y: {
            title: {
              display: true,
              text: 'Quantidade', // 🔹 Nome do eixo Y
              color: 'black',
              font: { size: 14 }
            },
            ticks: { color: 'white' },
            grid: { color: 'rgba(255, 255, 255, 0.2)' }
          }
        }
      }
    });
  }
}