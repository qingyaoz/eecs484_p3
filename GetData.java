import java.io.FileWriter;
import java.io.IOException;
import java.sql.Connection;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Statement;
import java.util.TreeSet;
import java.util.Vector;

import org.json.JSONObject;
import org.json.JSONArray;

public class GetData {

    static String prefix = "project3.";

    // You must use the following variable as the JDBC connection
    Connection oracleConnection = null;

    // You must refer to the following variables for the corresponding 
    // tables in your database
    String userTableName = null;
    String friendsTableName = null;
    String cityTableName = null;
    String currentCityTableName = null;
    String hometownCityTableName = null;

    // DO NOT modify this constructor
    public GetData(String u, Connection c) {
        super();
        String dataType = u;
        oracleConnection = c;
        userTableName = prefix + dataType + "_USERS";
        friendsTableName = prefix + dataType + "_FRIENDS";
        cityTableName = prefix + dataType + "_CITIES";
        currentCityTableName = prefix + dataType + "_USER_CURRENT_CITIES";
        hometownCityTableName = prefix + dataType + "_USER_HOMETOWN_CITIES";
    }

    // TODO: Implement this function
    @SuppressWarnings("unchecked")
    public JSONArray toJSON() throws SQLException {

        // This is the data structure to store all users' information
        JSONArray users_info = new JSONArray();
        
        try (Statement stmt = oracleConnection.createStatement(ResultSet.TYPE_SCROLL_INSENSITIVE, ResultSet.CONCUR_READ_ONLY)) {
            // Your implementation goes here....
            // Fetch user information
            ResultSet userResultSet = stmt.executeQuery("SELECT * FROM " + userTableName);
            
            while (userResultSet.next()) {
                try (Statement stmtSub = oracleConnection.createStatement(ResultSet.TYPE_SCROLL_INSENSITIVE, ResultSet.CONCUR_READ_ONLY)) {

                    JSONObject userObject = new JSONObject();
                    int user_id = userResultSet.getInt("user_id");
                    String first_name = userResultSet.getString("first_name");
                    String last_name = userResultSet.getString("last_name");
                    String gender = userResultSet.getString("gender");
                    int YOB = userResultSet.getInt("year_of_birth");
                    int MOB = userResultSet.getInt("month_of_birth");
                    int DOB = userResultSet.getInt("day_of_birth");

                    // Fetch user's friends
                    ResultSet friendsResultSet = stmtSub.executeQuery(
                        "SELECT user2_id AS friend_id FROM " + friendsTableName + " " +
                        "WHERE user1_id = " + user_id + " AND user2_id > " + user_id + " " +
                        "UNION " +
                        "SELECT user1_id AS friend_id FROM " + friendsTableName + " " +
                        "WHERE user2_id = " + user_id + " AND user1_id > " + user_id
                    );
                    JSONArray friendsArray = new JSONArray();
                    while (friendsResultSet.next()) {
                        friendsArray.put(friendsResultSet.getInt("friend_id"));
                    }

                    // Fetch user's current city
                    ResultSet currentCityResultSet = stmtSub.executeQuery(
                        "SELECT * " +
                        "FROM " + currentCityTableName + " UCC " +
                        "JOIN " + cityTableName + " C ON UCC.current_city_id = C.city_id " +
                        "WHERE user_id = " + user_id
                    );
                    JSONObject currentCityObject = new JSONObject();
                    if (currentCityResultSet.next()) {
                        currentCityObject.put("city", currentCityResultSet.getString("city_name"));
                        currentCityObject.put("state", currentCityResultSet.getString("state_name"));
                        currentCityObject.put("country", currentCityResultSet.getString("country_name"));
                    }

                    // Fetch user's hometown
                    ResultSet hometownResultSet = stmtSub.executeQuery(
                        "SELECT * " +
                        "FROM " + hometownCityTableName + " HCC " +
                        "JOIN " + cityTableName + " C ON HCC.hometown_city_id = C.city_id " +
                        "WHERE user_id = " + user_id
                    );
                    JSONObject hometownObject = new JSONObject();
                    if (hometownResultSet.next()) {
                        hometownObject.put("city", hometownResultSet.getString("city_name"));
                        hometownObject.put("state", hometownResultSet.getString("state_name"));
                        hometownObject.put("country", hometownResultSet.getString("country_name"));
                    }

                    // Construct user object
                    userObject.put("user_id", user_id);
                    userObject.put("first_name", first_name);
                    userObject.put("last_name", last_name);
                    userObject.put("gender", gender);
                    userObject.put("YOB", YOB);
                    userObject.put("MOB", MOB);
                    userObject.put("DOB", DOB);
                    userObject.put("friends", friendsArray);
                    userObject.put("current", currentCityObject);
                    userObject.put("hometown", hometownObject);

                    // Add user object to users_info array
                    users_info.put(userObject);
                    stmtSub.close();
                } catch (SQLException e) {
                    System.err.println(e.getMessage());
                }
            }
            stmt.close();
        } catch (SQLException e) {
            System.err.println(e.getMessage());
        }

        return users_info;
    }

    // This outputs to a file "output.json"
    // DO NOT MODIFY this function
    public void writeJSON(JSONArray users_info) {
        try {
            FileWriter file = new FileWriter(System.getProperty("user.dir") + "/output.json");
            file.write(users_info.toString());
            file.flush();
            file.close();

        } catch (IOException e) {
            e.printStackTrace();
        }

    }
}
