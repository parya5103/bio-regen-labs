import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-checkboximage',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div (click)="onCheckedChanged.emit(!checked)" 
         [class.border-indigo-500]="checked"
         class="cursor-pointer border-4 border-transparent rounded-2xl overflow-hidden transition-all hover:scale-105">
      <img [src]="src" class="w-32 h-32 object-cover" />
    </div>
  `
})
export class CheckboximageComponent {
  @Input() src!: string;
  @Input() checked = false;
  @Output() onCheckedChanged = new EventEmitter<boolean>();

  async getFile(): Promise<File | undefined> {
    return undefined; // Mock implementation
  }
}
