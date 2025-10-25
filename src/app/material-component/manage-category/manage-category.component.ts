import { Component, OnInit } from '@angular/core';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { MatTableDataSource } from '@angular/material/table';
import { Router } from '@angular/router';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { CategoryService } from 'src/app/services/category.service';
import { SnackbarService } from 'src/app/services/snackbar.service';
import { GlobalConstants } from 'src/app/shared/global-constants';
import { CategoryComponent } from '../dialog/category/category.component';
import { ConfirmationComponent } from '../dialog/confirmation/confirmation.component';

@Component({
  selector: 'app-manage-category',
  templateUrl: './manage-category.component.html',
  styleUrls: ['./manage-category.component.scss']
})
export class ManageCategoryComponent implements OnInit {
  displayedColumns: string[] = ['Category','Action'];
  dataSource:any;
  responseMessage:any;

  constructor(private categoryService:CategoryService,
    private router:Router,
    private snackbarService:SnackbarService,
    public dialog:MatDialog,
    private ngxService:NgxUiLoaderService) { }

  ngOnInit(): void {
    this.ngxService.start();
    this.tableData();
  }

  tableData() {
    this.categoryService.getCategories().subscribe((response:any)=>{
      this.ngxService.stop();
      this.dataSource = new MatTableDataSource(response);
    }, (error:any)=>{
      this.ngxService.stop();
      console.log(error.error?.message);

      if (error.error?.message) {
        this.responseMessage = error.error?.message;
      }
      else {
        this.responseMessage = GlobalConstants.genericError;
      }
      this.snackbarService.openSnackBar(this.responseMessage, GlobalConstants.error);
    })
  }

  applyFilter(event:Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }

  handleAddAction() {
    const dialogConfig = new MatDialogConfig();
    dialogConfig.data = {
      action: "Add"
    };
    dialogConfig.width = "500px";
    const dialogRef = this.dialog.open(CategoryComponent, dialogConfig);
    this.router.events.subscribe(()=>{
      dialogRef.close();
    })
    // onAddCategory function in CategoryComponent
    const sub = dialogRef.componentInstance.onAddCategory.subscribe((response)=>{
      this.tableData();
    })
  }

  handleEditAction(values:any) {
    const dialogConfig = new MatDialogConfig();
    dialogConfig.data = {
      action: "Edit",
      data:values
    };
    dialogConfig.width = "500px";
    const dialogRef = this.dialog.open(CategoryComponent, dialogConfig);
    this.router.events.subscribe(()=>{
      dialogRef.close();
    })
        // onEditCategory function in CategoryComponent
    const sub = dialogRef.componentInstance.onEditCategory.subscribe((response)=>{
      this.tableData();
    })
  }

  handleDeleteAction(values:any) {
    const dialogConfig = new MatDialogConfig();
    dialogConfig.data = {
      message: 'delete ' + values.name,
      confirmation: true
    };
    dialogConfig.width = "500px";
    const dialogRef = this.dialog.open(ConfirmationComponent, dialogConfig);

    const sub = dialogRef.componentInstance.onEmitStatusChange.subscribe((response)=>{
      this.ngxService.start();
      this.deleteProduct(values);
      dialogRef.close();
    })
  }

  deleteProduct(data: any) {
   console.log("data"+data);
   
  
    this.ngxService.start(); // Start loading indicator

    this.categoryService.deleteCategory(data.id).subscribe({
      next: (response) => {
        // Stop loading indicator
        this.ngxService.stop();
        this.dataSource.data = this.dataSource.data.filter((user: any) => user.id !== data.id);
        // Show success message
        this.snackbarService.openSnackBar('Category deleted successfully', 'success');
      },
      error: (error) => {
        // Stop loading indicator
        this.ngxService.stop();
  
        // Handle errors
        console.error(error);
        let errorMessage = GlobalConstants.genericError;
        if (error.error?.message) {
          errorMessage = error.error?.message;
        }
        this.snackbarService.openSnackBar(errorMessage, GlobalConstants.error);
      }
    });
  }
}
