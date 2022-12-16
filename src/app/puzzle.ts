export interface Puzzle {
    user: string,
    puzzle: Array<Array<number>>,
    mode: string,
    timer: Number,
    completed: boolean,
    size: Number,
    createdOn: Date,
    updatedOn: Date
}

export interface PuzzleArray extends Array<Puzzle> { }

export interface Validate {
    status: string
}