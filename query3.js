// Query 3
// Create a collection "cities" to store every user that lives in every city. Each document(city) has following schema:
// {
//   _id: city
//   users:[userids]
// }
// Return nothing.

function cities_table(dbname) {
    db = db.getSiblingDB(dbname);

    // TODO: implement cities collection here
    db.users.aggregate([
        {
            $group: {
                _id: "$current.city", // 按照当前居住城市分组
                users: { $addToSet: "$user_id" } // 将用户id添加到数组中，并确保唯一性
            }
        },
        {
            $out: "cities" // 将结果输出到cities集合中
        }
    ]);
    
    return;
}
