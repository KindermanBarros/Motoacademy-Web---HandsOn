import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BarChartComponent } from './bar-chart/bar-chart.component';
import { PieChartComponent } from './pie-chart/pie-chart.component';
import { DashboardService } from '../../services/dashboard.service';
import { saveAs } from 'file-saver';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    BarChartComponent, 
    PieChartComponent
  ],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {
  isLoading = true;
  isGeneratingReport = false;
  
  constructor(private dashboardService: DashboardService) {}
  
  ngOnInit() {
    setTimeout(() => {
      this.isLoading = false;
    }, 1000);
  }

  generateReport() {
    this.isGeneratingReport = true;
    
    this.dashboardService.generateReport().subscribe({
      next: (response) => {
        const blob = new Blob([response], { type: 'application/pdf' });
        
        const date = new Date();
        const filename = `relatorio-servicos-${date.getFullYear()}${(date.getMonth()+1).toString().padStart(2, '0')}${date.getDate().toString().padStart(2, '0')}.pdf`;
        
        saveAs(blob, filename);
        
        this.isGeneratingReport = false;
      },
      error: (error) => {
        console.error('Erro ao gerar relatório:', error);
        alert('Ocorreu um erro ao gerar o relatório. Por favor, tente novamente.');
        this.isGeneratingReport = false;
      }
    });
  }
}
