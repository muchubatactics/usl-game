# usl-game

A web based game to teach children sign language alphabet

## Backend

We're using Google's Firebase for the backend. The database is a Firestore database.

### Database Structure or Schema

We have two collections in the database: `players` and `sessions`. The `players` collection stores the user's game information and the `sessions` collection stores the user's session information like duration played, login times, logout times, etc.

#### players

```
{
    id: string,
    name: string,
    joinedAt: timestamp,
    badges: array,
    age: number,
    scores: array<array<number>>, // array of arrays of integers
}
```

#### sessions

```
{
    id: string,
    playerId: string,
    loginTime: timestamp,
    logoutTime: timestamp,
    durationPlayed: number,
}
```

**NOTE**: The backend expects all the data it receives to be in the format specified above.
