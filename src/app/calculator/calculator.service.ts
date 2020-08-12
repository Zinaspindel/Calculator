import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
@Injectable({
  providedIn: 'root'
})
export class CalculatorService {
  valueChanged = new Subject<string>();
  textWidth:number;
  firstFactor: string = null;
  nextFactor: string= null;
  firstOperator: string;
  nextOperator: string;
  nextValue = false;
  equal = false;
  lastWidth: number= null;
  chainedOperators:boolean = false;

  addNumber(num:string) {
    if(this.nextValue){
      this.addDigits('next',num);
    } else if(!this.nextValue && this.nextFactor!=null){
      this.firstFactor = this.nextFactor;
      this.addFirstDigit('next',num);
    } else {
      this.addDigits('first',num);
    }
  }
  clear(status:string){
    if(status=='AC'){
      this.clearAllStats();
      return 'AC';
    } else {
      if(this.equal){
        this.firstFactor=null;
        this.nextValue = false;
        this.equal = false;
      }
      this.nextFactor == null? this.firstFactor = null: this.nextFactor = null;
      this.valueChanged.next('0');
      return 'AC';
    }
  }
  getPrecent(){ 
    let first = +this.firstFactor/100;
    let next = +this.nextFactor/100;
    let value = this.fixTooSmallValue(first,next);
    this.fixValueDisplayAndEmitIt(value);
  }
  changePositivity(){
    let first = +this.firstFactor*-1;
    let next = +this.nextFactor*-1;
    let value = this.nextFactor == null ? this.firstFactor = first+'' : this.nextFactor = next+'';
    this.fixValueDisplayAndEmitIt(value);
  }
  useOperator(operator:string){ 
    this.equal = false;
    this.nextValue = true;
    this.trackOperatorsOrder(operator);
    
    if(this.nextOperator!=null){
      if(operator=='=')
        this.equal = true;
      //operator == '=' ? this.firstOperator = this.firstOperator : this.firstOperator = operator;
      this.operatorHandlers();     
    }
  }
  getDecimel(){
    let value = this.nextFactor == null? this.firstFactor+='.': this.nextFactor+='.'; 
    this.fixValueDisplayAndEmitIt(value);
  }
  getValueTextWidth(currentValue:string){
    let displayFontSizeEl = document.getElementById('currentValue');
    let textArea = this.setTextAreaProperties(currentValue);
    let width = textArea.offsetWidth;
    if(width>270){
      textArea.style.display='none';
      if(this.lastWidth==width)
        return;
      this.lastWidth = width;
      displayFontSizeEl.style.fontSize = (1/(width/10)*1800) +'px';
    }else{
      this.lastWidth=null;
      displayFontSizeEl.style.fontSize = 68+'px';
    }
  }
  isCommaNeeded(value:string):string{
    let negativeValue: boolean;
    
    if(value.length>=4){
      if(value.indexOf('-')!=-1){
        negativeValue = true
        value = value.slice(1);
      }
      let fixedValue = '';
      let count = 0;
      let isFraction = value.indexOf('.');
      let fraction = null;
      if(isFraction!=-1){
        fraction = value.slice(isFraction);
        value = value.slice(0,isFraction);
      }
      for(let i=value.length-1; i>=0; i--){
        if(count==3){
          fixedValue+=',';
          count=0;
        }
        fixedValue += value.charAt(i);
        count++;
      }
      if(negativeValue)
        fixedValue = fixedValue + '-';
      return fraction? this.reverseString(fixedValue)+fraction: this.reverseString(fixedValue);
    }
    return value;
  }
  reverseString(str:string) {
    var splitString = str.split(""); 
    var reverseArray = splitString.reverse();
    var joinArray = reverseArray.join(""); 
    return joinArray; 
  }
  fixFractionLength(value:string){
    let fraction = value.indexOf('.');
    let fixedFraction:string;
    let fixedValue:string; 
    if(fraction==-1){
      return value;
    } else {
      fixedFraction = value.slice(fraction);
      fixedFraction = fixedFraction.slice(0,7);
      fixedValue = value.slice(0,fraction) + fixedFraction
      return fixedValue;
    }
  }
  limitInputNumbers(value:string): boolean{
    let isFraction = value.indexOf('.');
    if(isFraction!=-1){
      let fractionLength = value.slice(isFraction+1);
      if(fractionLength.length>5)
        return false;
    }
    return true;
  }
  trackOperatorsOrder(operator:string){
    if(this.firstOperator==null){
      this.firstOperator = operator;
      if(this.nextFactor==null)
        return;
    } else {
      if(this.nextFactor==null){
        this.firstOperator = operator;
        return;
      }
      this.nextOperator = operator
    }
  }
  operatorHandlers(){
    let first = +this.firstFactor;
    let next = +this.nextFactor;
    let operator = this.nextOperator==null? this.nextOperator : this.firstOperator;
    operator = operator == '='? this.firstOperator: operator;
    this.firstOperator = this.nextOperator;
    this.nextOperator = null;

    switch(operator){
      case '+':
        first += next;
        this.updateValue(first);
        break;
      case '-':
        first -= next;
        this.updateValue(first);
        break;
      case '*':
        first *= next;
        this.updateValue(first);
        break;
      case '/':
        first /= next;
        this.updateValue(first);
        break;
    }
  }
  updateValue(first:number){
    let finalValue;
    finalValue = this.firstFactor = first+'';
    this.nextFactor = null;
    this.fixValueDisplayAndEmitIt(finalValue);
  }
  fixTooSmallValue(first:number,next:number):string{
    if(this.nextFactor==null){
      if(first<0.000001)
        first= 0;
      return this.firstFactor = first+'';
    }else{
      if(next<0.000001)
        next= 0;
      return this.nextFactor = next+'';
    }
  }
  clearAllStats(){
    this.firstFactor = null;
    this.nextFactor = null;
    this.nextValue = false;
    this.valueChanged.next('0');
  }
  setTextAreaProperties(currentValue:string):HTMLElement{
    let textArea = document.getElementById('valueDisplay');
    textArea.innerHTML = currentValue;
    textArea.style.display= 'block';
    return textArea;
  }
  fixValueDisplayAndEmitIt(value:string){
    value = this.isCommaNeeded(value);
    value = this.fixFractionLength(value);
    this.valueChanged.next(value); 
  }
  addFirstDigit(factor:string, num:string){
    if(num == '0')
      return;
    let value = factor == 'next'? this.nextFactor = num : this.firstFactor = num;
    this.valueChanged.next(value);
  }
  addDigitsToValue(factor:string,num:string){
    let value = factor=='next' ? this.nextFactor += num : this.firstFactor += num;
    value = this.isCommaNeeded(value);
    this.valueChanged.next(value);
  }
  addDigits(factor:string,num:string){
    if(factor=='first'?this.firstFactor==null:this.nextFactor==null){
      this.addFirstDigit(factor,num);
    }else{
      if(!this.limitInputNumbers(factor=='first'?this.firstFactor:this.nextFactor))
        return;
      this.addDigitsToValue(factor,num);
    }
  }
}
