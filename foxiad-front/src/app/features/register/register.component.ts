import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../core/services/auth/auth.service';
import {TokenService} from "../../core/services/token/token.service";
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './register.component.html',
  styleUrl: './register.component.css',
})
export class RegisterComponent {
  registerForm: FormGroup;

  constructor(
    private readonly fb: FormBuilder,
    private readonly router: Router,
    private readonly authService: AuthService,
    private readonly tokenService: TokenService,
    private toastr: ToastrService,
  ) {
    this.registerForm = this.fb.group({
      firstName: ['', [Validators.required]],
      lastName: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', [Validators.required]],
      job: ['', [Validators.required]],
      searchJob: [false],
      rgpd: [false, [Validators.requiredTrue]],
    });
  }

  isFieldInvalid(field: string): boolean {
    const formControl = this.registerForm.get(field);
    return !!formControl && formControl.invalid && (formControl.dirty || formControl.touched);
  }

  onSubmit(): void {
    if (this.registerForm.valid) {
      this.authService.register(this.registerForm.value).subscribe({
        
            next: value => {
              this.tokenService.saveToken(value.data.token);

              this.router.navigate(['/start']);
              this.toastr.success(value.message, 'success');
            },
            error: err => {
              this.toastr.error(err.error.message, 'error');
            },
            complete: () => {},
      });
  
      //this.tokenService.saveToken("eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6Mn0.QK7xgC6G0tR0EhiDkYCNbOGtTACswCjF9MUmOB_1ttg", this.registerForm.value.email);
      console.log('Form submitted successfully:', this.registerForm.value);
      this.router.navigate(['/start']);
    } else {
      this.registerForm.markAllAsTouched();
    }
  }

  logout(): void {
    this.tokenService.deconnexion();
  }
}
