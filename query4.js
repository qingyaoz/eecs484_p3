// Query 4
// Find user pairs (A,B) that meet the following constraints:
// i) user A is male and user B is female
// ii) their Year_Of_Birth difference is less than year_diff
// iii) user A and B are not friends
// iv) user A and B are from the same hometown city
// The following is the schema for output pairs:
// [
//      [user_id1, user_id2],
//      [user_id1, user_id3],
//      [user_id4, user_id2],
//      ...
//  ]
// user_id is the field from the users collection. Do not use the _id field in users.
// Return an array of arrays.

function suggest_friends(year_diff, dbname) {
    db = db.getSiblingDB(dbname);

    let pairs = [];
    // TODO: implement suggest friends
    // Step 1: Retrieve male and female users separately
    // var males = db.users.find(
    //     { gender: "male" }
    //     //{ user_id: 1, YOB: 1, "hometown.city": 1, friends: 1 }
    // );
    // var females = db.users.find(
    //     { gender: "female" }
    //     //{ user_id: 1, YOB: 1, "hometown.city": 1, friends: 1 }
    // );
    // let count = 0;
    db.users.find({ gender: "male" }).forEach((male) => {
        //print(male.user_id);
        db.users.find({ gender: "female" }).forEach((female) => {
            // Check YOB difference
            //print([male.user_id, female.user_id]);
            if (Math.abs(male.YOB - female.YOB) < year_diff) {
                // Check if not friends
                // print(count);
                // count++;
                if (
                    (
                        male.friends.indexOf(female.user_id) === -1) &&
                    (
                        female.friends.indexOf(male.user_id) === -1) &&
                    male.hometown.city == female.hometown.city
                    ) {
                    // Check if from the same hometown city
                    // Add the pair
                    //print([male.user_id, female.user_id]);
                    pairs.push([male.user_id, female.user_id]);
                }
            }
        });
    });
    return pairs;
}
