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
    badges: array,
    age: number,
    joinedAt: timestamp/Date, // UNIX timestamp since epoch or Date object but most preferably UNIX timestamp should be used since it's easier to work with
    scores: string, // stored as JSON string that resolves to array of arrays of integers e.g. [[1, 2, 3], [4, 5, 6], [7, 8, 9]]
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

**NOTE**: The backend expects all the data it receives to be in the format specified above. We've not included deletion of users or sessions in the backend. We're assuming that the user will not be deleted from the database. **All data is stored in the database permanently**.
