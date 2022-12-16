import { Component, OnInit } from '@angular/core';
import { AuthService } from '../auth.service';
import { BackendService } from '../backend.service';

@Component({
  selector: 'app-puzzle',
  templateUrl: './puzzle.component.html',
  styleUrls: ['./puzzle.component.css']
})
export class PuzzleComponent implements OnInit {
  continue: boolean = false;
  size: number = 9;
  arr: number[][];
  prev_arr: number[][] = [];
  new_arr: number[][] = [];
  d: Map<string,boolean> = new Map();

  constructor(private backendService: BackendService,
    private authService: AuthService) {
    this.arr = Array(this.size).fill(Array(this.size).fill(0));
    for (var i in this.arr){
      for (var j in this.arr){
        this.d.set(i.toString()+j.toString(), false);
      }
    }
    // console.log(this.d)
  }

  ngOnInit(): void {
    this.getPuzzle();
  }

  disableCell(id: any){
    let val = document.getElementById(id) as HTMLInputElement;
    if (val.value == "0") {
      return false
    }
    return true;
  }

  getPuzzle(){
    this.backendService.getPuzzle().subscribe({
      next: (data) => {
        if (data.length){
          this.continue = true;
          this.prev_arr = data[0].puzzle;
        }
      },
      error: (error) => {
        console.log(error);
      }
    })
  }

  getPrev(){
    this.arr = this.prev_arr;
    this.new_arr = JSON.parse(JSON.stringify(this.prev_arr));
  }

  mode(event: Event) {
    let a = event.target as HTMLElement;
    // console.log(a.innerHTML)
    let b = {
      "puzzle": [],
      "mode": a.innerHTML[0],
      "timer": 0,
      "size": this.size
    }
    this.backendService.createPuzzle(b).subscribe({
      next: (data) => {
        if (data){
          this.arr = data.puzzle;
          this.new_arr = JSON.parse(JSON.stringify(data.puzzle));
        }
      },
      error: (error) => {
        console.log(error);
      }
    })
  }

  highlight(id:any){
    // console.log(id);
    this.d.set(id.toString(), true);
    // console.log(this.d)
    // let el = document.getElementById(id) as HTMLElement;
    // console.log(el)
  }

  highlightCell(id:any){
    // console.log(id.toString());
    // console.log(this.d.get(id.toString()));
    return this.d.get(id.toString());
  }

  backspaceEvent(event:Event) {
    let a = event.target as HTMLElement;
    this.d.set(a.id.toString(), false);
    let cell_id = a.id.split('').map(Number);
    this.new_arr[cell_id[0]][cell_id[1]] = 0;
    // console.log(a.id);
    // console.log(this.d);
  }

  verifyCell(event: Event) {
    let a = event.target as HTMLElement;
    let b = event as KeyboardEvent;
    let val = parseInt(b.key)
    let cell_id = a.id.split('').map(Number);
    // console.log(cell_id)
    this.new_arr[cell_id[0]][cell_id[1]] = val;
    // console.log(this.new_arr)
    this.callValidate(a);
  }

  callValidate(a:any){
    this.backendService.validate(this.new_arr).subscribe({
      next: (data) => {
        if (data.status == "error"){
          this.highlight(a.id);
        }
      },
      error: (error) => {
        this.authService.refreshToken();
        this.callValidate(a);
      }
    })
  }
}
