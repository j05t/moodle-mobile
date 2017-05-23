GIT Repo: https://github.com/mujicnev15/swd2015-ri-moodle

Topic-B "RIA-Moodle"
--------------------
Problem:
Students need information from the eLearning platform, but Moodle is "unusabe" on small displays. The official moodle smartphone app is kind of a mess and very slow.
Solution:
Create a responsive web app (with offline features) to make use of moodle easy, intuitive and maybe funny!
Main-Features:
- you know it better than me -
Hint:
simulate a webservices with mock up data on your own server, or use elearning.fh-joanneum.at. (**)

Replace YOUR_USERNAME, YOUR_PASSWORD, YOUR_TOKEN and YOUR_USERID with your own values.

# Get the user token (for mobile version, the administrator has to create a new service if he wants to restrict access etc. to it)
https://elearning.fh-joanneum.at/login/token.php?username=YOUR_USERNAME&password=YOUR_PASSWORD&service=moodle_mobile_app


# Get some user information (including the users id)
https://elearning.fh-joanneum.at/webservice/rest/server.php


&wsfunction=mod_wiki_get_page_contents
&values[0]=



# Get all the courses that the user is enrolled in
https://elearning.fh-joanneum.at/webservice/rest/server.php?moodlewsrestformat=json&wsfunction=core_enrol_get_users_courses&wstoken=YOUR_TOKEN&userid=YOUR_USERID
    

see also:

- Moodle Function API doc over REST: http://stackoverflow.com/questions/19903456/moodle-function-api-doc-over-rest
  StackOverflow hat hierzu zwei interessante Antworten
- Überblick von verfügbaren Web servicehttps://docs.moodle.org/dev/Web_service_API_functions#Core_web_service_functions
- Der Source von den Webservices: https://github.com/moodle/moodle/tree/master/webservice
- PHP-REST Client: https://github.com/moodlehq/sample-ws-clients/tree/master/PHP-REST
- z.b. URL zum Webservice vom elearning Moodle: https://elearning.fh-joanneum.at/webservice/rest/server.php


// LVs auflisten
&wsfunction=core_enrol_get_users_courses&userid=314
// LV Details
&wsfunction=core_course_get_contents&courseid=1139
// Online Räume
&wsfunction=core_course_get_contents&courseid=1198
// Bewertungen
&wsfunction=gradereport_user_get_grades_table&courseid=1513&userid=314
// Submissions
&wsfunction=mod_assign_get_assignments