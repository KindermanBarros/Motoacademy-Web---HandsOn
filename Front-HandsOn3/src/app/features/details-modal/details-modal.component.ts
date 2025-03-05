import { Component, Input, ElementRef, ViewChild, AfterViewInit, EventEmitter, Output, OnInit, } from '@angular/core';
import * as bootstrap from 'bootstrap';
import { functionalityDataModal } from './functionalityDataModal';
import { Router } from '@angular/router';
import { NgIf } from '@angular/common';

@Component({
  selector: 'app-details-modal',
  standalone: true,
  imports: [NgIf],
  templateUrl: './details-modal.component.html',
  styleUrl: './details-modal.component.css'
})
export class DetailsModalComponent implements AfterViewInit, OnInit {

  @Input() functionalityDataModal: functionalityDataModal | undefined;
  @Output() deleteEvent = new EventEmitter<number>();

  @ViewChild('detailsModal', { static: false }) modalElement!: ElementRef;
  modalInstance!: bootstrap.Modal;

  isClientesRoute = false;
  constructor(private router: Router) {}


  ngOnInit(): void {
    this.router.events.subscribe(() => {
      this.isClientesRoute = this.router.url === '/clients';
    });
  }


  ngAfterViewInit() {
    this.modalInstance = new bootstrap.Modal(this.modalElement.nativeElement);
  }

  openModal() {
    this.modalInstance.show();
  }

  closeModal() {
    this.modalInstance.hide();
  }

  deleteItem() {
    if (confirm('Tem certeza que deseja excluir ?')) {
      this.deleteEvent.emit(this.functionalityDataModal?.functionalityId);
      this.closeModal();
    }
  }
}
