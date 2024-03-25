// Query 6
// Find the average friend count per user.
// Return a decimal value as the average user friend count of all users in the users collection.

function find_average_friendcount(dbname) {
    db = db.getSiblingDB(dbname);

    // TODO: calculate the average friend count
    // let totalFriends = 0;
    // let userCount = db.users.count();

    // db.users.find().forEach(user => {
    //     totalFriends += user.friends.length;
    // });

    // return totalFriends / userCount;
    // Aggregate to calculate the average number of friends and output to a collection
    db.users.aggregate([
        {
        $group: {
            _id: null, // Grouping key not used, thus aggregating all documents
            totalFriends: { $sum: { $size: "$friends" } }, // Sum the sizes of all friends arrays
            userCount: { $sum: 1 }, // Count the number of documents processed
        },
        },
        {
        $project: {
            _id: 0,
            averageFriendCount: { $divide: ["$totalFriends", "$userCount"] }, // Calculate the average
        },
        },
        {
        $out: "averageFriendCountResult", // Output the result into a collection named 'averageFriendCountResult'
        },
    ]);

      // Since $out does not allow returning the result directly from the aggregation,
      // you need to fetch the result from the 'averageFriendCountResult' collection.
    let result = db.averageFriendCountResult.find().toArray();

    if (result.length > 0) {
    return result[0].averageFriendCount;
    } else {
    return 0; // In case there are no users or an error occurs
    }

}
