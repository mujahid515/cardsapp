export interface User {
    uid: string; 
    firstName: string;
    lastName: string;
    email: string;
    appsData: Array<any>;
    enrolledVia: string;
}

export interface Card {
    active: boolean;
    cid: string; 
    category: string;
    question: string;
    correctAnswer: string;
    fakeAnswer1: string;
    fakeAnswer2: string;
    fakeAnswer3: string;
    points: number;
    app: string;
}

export interface Game {
    active: boolean;
    gid: string; 
    category: string;
    openTo: string;
    players: Array<any>;
    winner: string;
    winningScore: number;
    app: string;
}

export interface App {
    active: boolean;
    aid: string; 
    categories: Array<any>;
    description: string;
    image: string;
    title: string;
}
