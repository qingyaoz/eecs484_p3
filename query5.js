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
    // TODO: implement oldest friends// 创建包含每对朋友的文档
    // db.users.aggregate([
    //     { $unwind: "$friends" },
    //     {
    //         $project: {
    //             _id: 0, // do not show the default _id
    //             user_id: "$friends",
    //             friends: "$user_id"
    //         }
    //     },
    //     { $out: "flat_user" } 
    // ]);

    // db.users.aggregate([
    //     {
    //         $project: {
    //             user_id: 1,
    //             friends: 1,
    //         }
    //     },
    //     { $out: "new_user" }
    // ]);

    // // 遍历 new_user 中的每个文档
    // db.new_user.find().forEach(function(doc) {
    //     // 查询 flat_user 中具有相同 user_id 的文档，并将它们的 friends 字段添加到当前文档的 friends 数组中
    //     db.flat_user.find({ user_id: doc.user_id }).forEach(function(flatDoc) {
    //         // 将 flatDoc 中的 friends 添加到当前文档的 friends 数组中
    //         doc.friends = doc.friends.concat(flatDoc.friends);
    //     });

    //     // 更新当前文档，将新的 friends 数组保存到数据库中
    //     db.new_user.update({ _id: doc._id }, { $set: { friends: doc.friends } });
    // });

    // var oldestFriends = db.new_user.aggregate([
    //     {
    //         $lookup: {
    //             from: "users", // 关联的集合名
    //             localField: "friends", // 当前集合中用于关联的字段
    //             foreignField: "user_id", // 关联集合中的字段
    //             as: "friendDetails" // 关联后存储的字段名
    //         }
    //     },
    //     {
    //         $project: {
    //             _id: 0,
    //             user_id: "$user_id",
    //             oldestFriendYOB: { $min: "$friendDetails.YOB" }, // 选择朋友中YOB最小的
    //             oldestFriendID: { $min: "$friendDetails.user_id" } // 选择朋友中user_id最小的
    //         }
    //     },
    //     // 根据用户ID升序排序
    //     { $sort: { user_id: 1 } }
    // ]);

    // // 将结果转换为JSON对象
    // oldestFriends.forEach(function(new_user) {
    //     if (new_user.oldestFriendID != null) {
    //         results[new_user.user_id] = new_user.oldestFriendID;
    //     }
    // });
    var oldestFriends = db.users.aggregate([
        {
            $lookup: {
                from: "users", // 关联的集合名
                localField: "friends", // 当前集合中用于关联的字段
                foreignField: "user_id", // 关联集合中的字段
                as: "friendDetails" // 关联后存储的字段名
            }
        },
        {
            $project: {
                _id: 0,
                user_id: "$user_id",
                oldestFriendYOB: { $min: "$friendDetails.YOB" }, // 选择朋友中YOB最小的
                oldestFriendID: { $min: "$friendDetails.user_id" } // 选择朋友中user_id最小的
            }
        },
        // 根据用户ID升序排序
        { $sort: { user_id: 1 } }
    ]);

    // 将结果转换为JSON对象
    oldestFriends.forEach(function(users) {
        if (users.oldestFriendID != null) {
            results[users.user_id] = users.oldestFriendID;
        }
    });

    return results;
}
