var challengesList = db.getCollection('challenge').find({});
var usersList = db.getCollection('user').find({});

function getWinnersInformation(challengesCollection, attemptUsersList, isSortBySkipedIndex)
{
    var stats = [];
    var challenges = [];
    var challengesFilterd = [];

    challengesCollection.sort({suborder: 1})
    challengesCollection.forEach( function (challange) 
    {
        if(challange["title"].indexOf("Challenge")>=0 && challange["title"].indexOf("codeCampChallenge")==-1)
        {
            challenges.push(challange["_id"].str);
        }
    });

    attemptUsersList.forEach( function(user)
    { 
        var sequence = [];
        var answerList = [];
        var answers = user.challengeMap;

        var lastTimeStamp = 0.0;
        var sequenceTimeStamp = 0.0;
        var lastCompletedQuiz = -1;

        var date = new Date();
        var sequenceTime = new Date();
        
        for (key in answers)
        {
            var answer = answers[key];

            answerList.push(answer);
            sequence.push(answer["id"]);
            lastTimeStamp = answer["completedDate"];
        }

        var answered_count = 0;
        var skip_indexs = [];
        var skipCount = 0;

        loopchallengesFilterd:
        for(var a=0; a < challenges.length; a++)
        {
            var challange = challenges[a];

            if (sequence.indexOf(challange) == -1)
            {
                if(skipCount == 0 && lastCompletedQuiz != -1)
                {
                    var ans = answerList[lastCompletedQuiz];
                    sequenceTimeStamp = ans["completedDate"];
                }
                skip_indexs.push(a+1);
                skipCount++;
            } 
            else 
            {
                lastCompletedQuiz = sequence.indexOf(challange);
                answered_count++;
            }
        }
        
        skip_indexs.sort(function (a, b)
        {
           return a.count > b.count;
        });

        date = new Date(lastTimeStamp);
        sequenceTime = new Date(sequenceTimeStamp);

        var stat = {"user_email": user.email,
            "name": (user.firstname+" "+user.lastname),
            "username": user.username,
            "eventusercode": user.eventusercode, 
            "gender": user.gender,
            "profile_image": user.picture,
            "answered_count": answered_count, 
            "sequence_length": skip_indexs[0]-1,
            "first_quiz_skipped": skip_indexs[0],
            "number_of_quiz_skiped":skip_indexs.length,
            "sequence_complete_time": (sequenceTimeStamp == 0 ? "":sequenceTime.toString('yyyy/MM/dd HH:mm:ss')),
            "last_quiz_completed_time": (lastTimeStamp == 0 ? "":date.toString('yyyy/MM/dd HH:mm:ss'))};

        stats.push(stat);
    });

    if(isSortBySkipedIndex)
    {
        stats.sort(function (a, b){
            return b.first_quiz_skipped - a.first_quiz_skipped;
        });
    }
    else
    {
        stats.sort(function (a, b){
            return b.answered_count - a.answered_count;
        });  
    }
    return stats;
}

// send true for 'isSortBySkipedIndex' if you filter from skip index, else false for answerd count
printjson(getWinnersInformation(challengesList, usersList, true));