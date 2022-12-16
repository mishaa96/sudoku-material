import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Puzzle, PuzzleArray,Validate } from './puzzle';

@Injectable({
  providedIn: 'root'
})
export class BackendService {

  constructor(private http: HttpClient) { }

  getPuzzle(): Observable<PuzzleArray> {
    return this.http.get('http://127.0.0.1:8000/api/v1/puzzle') as Observable<PuzzleArray>;
  }

  createPuzzle(data:any): Observable<Puzzle>{
    return this.http.post('http://127.0.0.1:8000/api/v1/puzzle', JSON.stringify(data)) as Observable<Puzzle>
  }

  validate(data:any):Observable<Validate> {
    return this.http.post('http://127.0.0.1:8000/api/v1/validate', JSON.stringify({"puzzle": data})) as Observable<Validate>
  }
}
