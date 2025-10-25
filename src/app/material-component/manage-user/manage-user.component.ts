import { Component, OnInit } from '@angular/core';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { MatTableDataSource } from '@angular/material/table';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { SnackbarService } from 'src/app/services/snackbar.service';
import { UserService } from 'src/app/services/user.service';
import { GlobalConstants } from 'src/app/shared/global-constants';
import { ConfirmationComponent } from '../dialog/confirmation/confirmation.component';

@Component({
  selector: 'app-manage-user',
  templateUrl: './manage-user.component.html',
  styleUrls: ['./manage-user.component.scss']
})
export class ManageUserComponent implements OnInit {

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
      this.delete(values);
      dialogRef.close();
    })
  }


  delete(data: any) {
  
  
    this.ngxService.start(); // Start loading indicator
    const requestBody = {
      "id":data.id
    };
    this.userService.deleteUser(requestBody).subscribe({
      next: (response) => {
        // Stop loading indicator
        this.ngxService.stop();
        
        // Update the table data by filtering out the deleted user
        this.dataSource.data = this.dataSource.data.filter((user: any) => user.id !== data.id);
  
        // Show success message
        this.snackbarService.openSnackBar('User deleted successfully', 'success');
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
  displayedColumns: string[] = ['name', 'email', 'contactNumber','role','delete', 'status'];
  dataSource:any;
  responseMessage:any;

  constructor(private userService:UserService,
    public dialog:MatDialog,
    private snackbarService:SnackbarService,
    private ngxService:NgxUiLoaderService) { }

  ngOnInit(): void {
    this.ngxService.start();
    this.tableData();
  }

  tableData() {
    // retrieve all users from db
    this.userService.getUsers().subscribe((response:any)=>{
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

  onChange(status:any, id:any) {
    this.ngxService.start();
    var data = {
      status: status.toString(),
      id: id
    }
    console.log(data);
    // update status of user to the backend
    this.userService.update(data).subscribe((response:any)=>{
      this.ngxService.stop();
      this.responseMessage = response?.message;
      this.snackbarService.openSnackBar(this.responseMessage, "success");
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
  updateUserRole(user: any) {
    this.ngxService.start();
    const requestBody = { id: user.id, role: user.role };

    this.userService.updateUserRole(requestBody).subscribe((response: any) => {
      this.ngxService.stop();
      this.responseMessage = response.message;
      this.snackbarService.openSnackBar(this.responseMessage, 'success');
    }, (error: any) => {
      this.ngxService.stop();
      console.log(error.error?.message);
      if (error.error?.message) {
        this.responseMessage = error.error?.message;
      }
      else {
        this.responseMessage = GlobalConstants.genericError;
      }
      this.snackbarService.openSnackBar(this.responseMessage, GlobalConstants.error);
    });
  }
 
}
