import { Component, Input, ElementRef, ViewChild, AfterViewInit, EventEmitter, Output } from '@angular/core';
import * as bootstrap from 'bootstrap';
import { functionalityDataModal } from './functionalityDataModal';

@Component({
  selector: 'app-details-modal',
  standalone: true,
  imports: [],
  templateUrl: './details-modal.component.html',
  styleUrl: './details-modal.component.css'
})
export class DetailsModalComponent implements AfterViewInit {
  @Input() functionalityDataModal: functionalityDataModal | undefined;
  @Output() deleteEvent = new EventEmitter<number>();

  @ViewChild('detailsModal', { static: false }) modalElement!: ElementRef;
  modalInstance!: bootstrap.Modal;

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
