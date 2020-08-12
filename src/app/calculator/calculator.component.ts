import { Component, OnInit } from '@angular/core';
import { CalculatorService } from './calculator.service';
import { Subscription, Subject } from 'rxjs';

@Component({
  selector: 'app-calculator',
  templateUrl: './calculator.component.html',
  styleUrls: ['./calculator.component.css']
})
export class CalculatorComponent implements OnInit {
  currentValue:string = '0';
  valueSubscription: Subscription;
  AC: string = 'AC';
  
  constructor(private calService : CalculatorService) { }
  
  ngOnInit(): void {
    this.valueSubscription = this.calService.valueChanged.subscribe((value:string)=>{
      this.currentValue = value;
    })
  }
  getNumber(number:string) {
    this.calService.addNumber(number);
    this.AC = 'C';
    this.calService.getValueTextWidth(this.currentValue);
  }
  ngOnDestroy():void{
    this.valueSubscription.unsubscribe();
  }
  onClear(){
    this.AC = this.calService.clear(this.AC);
    this.calService.getValueTextWidth(this.currentValue);
  }
  getPrecent(){
    this.calService.getPrecent();
    this.calService.getValueTextWidth(this.currentValue);
  }
  onChangePositivity(){
    this.calService.changePositivity();
    this.calService.getValueTextWidth(this.currentValue);
  }
  useOperator(operator:string){
    this.calService.useOperator(operator); 
    this.calService.getValueTextWidth(this.currentValue);
  }
  getDecimel(){
    if(this.currentValue.includes('.'))
      return;
    this.calService.getDecimel();
    this.calService.getValueTextWidth(this.currentValue);
  }
}


