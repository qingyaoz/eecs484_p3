// Query 5
// Find the oldest friend for each user who has a friend. For simplicity,
// use only year of birth to determine age, if there is a tie, use the
// one with smallest user_id. You may find query 2 and query 3 helpful.
// You can create selections if you want. Do not modify users collection.
// Return a javascript object : key is the user_id and the value is the oldest_friend id.
// You should return something like this (order does not matter):
// {user1:userx1, user2:userx2, user3:userx3,...}

function oldest_friend(dbname) {
  db = db.getSiblingDB(dbname);

  let results = {};
  
  // ------------- Prepare: flat users's friends -------------
  db.users.aggregate([
      { $unwind: "$friends" },
      {
          $project: {
              _id: 0, // do not show the default _id
              user_id: "$user_id",
              friends: "$friends"
          }
      },
      { $out: "f_users" } // output results to flat_users collection
  ]);
  
  // ------------- Prepare: make friends bi-directional -------------
  // ---- By For-Loop ----
  db.f_users.find().forEach((row) => {
      db.f_users.insertOne({ user_id: row.friends, friends: row.user_id });
  });

  db.f_users.aggregate([
    {
      $group: {
          _id: "$user_id",
          friends: { $addToSet: "$friends" }
      }
    },
    {
      $project: {
          _id: 0,
          user_id: "$_id",
          friends: 1 
      }
    },
    {$out: "all_friends"}
  ]);

  // Link to user to get YOB
  db.all_friends.aggregate([
    {
      $lookup: {
        from: "users", // name of linked collection
        localField: "friends", // column from current collection to link
        foreignField: "user_id", // column from linked collection to link
        as: "friendDetails", // save as
      },
    },
    {
      $project: {
        "user_id": 1,
        "friends": 1,
        "friendDetails.user_id": 1, 
        "friendDetails.YOB": 1,
        _id: 0
      }
    },
    {
      $out: "all_friends"
    }
  ]);
  
  // ------------- Find Oldest Friend -------------
  // By For-Loop
  // db.all_friends.find().forEach(function(doc) {
  //   var temp = doc.friendDetails[0].user_id;
  //   var yob = doc.friendDetails[0].YOB;
  //   for (i = 1; i < doc.friendDetails.length; i++) {
  //     if (doc.friendDetails[i].YOB < yob) {
  //       yob = doc.friendDetails[i].YOB;
  //       temp =  doc.friendDetails[i].user_id;
  //     } else if (doc.friendDetails[i].YOB == yob) {
  //       if (doc.friendDetails[i].user_id < temp) {
  //         temp = doc.friendDetails[i].user_id;
  //       }
  //     }
  //   }
  //   results[doc.user_id] = temp;
  // });

  // By Aggregate
  db.all_friends.aggregate([
    {
      $lookup: {
        from: "users",
        localField: "friends",
        foreignField: "user_id",
        as: "friendDetails"
      }
    },
    {
      $project: {
        user_id: 1,
        oldest_friend: {
          $min: {
            $map: {
              input: "$friendDetails",
              as: "friend",
              in: {
                $cond: [
                  { $eq: ["$$friend.YOB", { $min: "$friendDetails.YOB" }] },
                  "$$friend.user_id",
                  undefined
                ]
              }
            }
          }
        }
      }
    },
    {
      $group: {
        _id: "$user_id",
        oldest_friend: { $first: "$oldest_friend" }
      }
    },
    {
      $project: {
        _id: 0,
        user_id: "$_id",
        oldest_friend: 1
      }
    }
  ]).forEach(doc => {
    results[doc.user_id] = doc.oldest_friend;
  });
  
  return results;
}
