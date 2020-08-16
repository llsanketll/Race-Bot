const questions = require("./questions.js");

module.exports = function startRace(args, message, bot) {
  message.channel.send(`${message.author} \n Race Starting in **3**`);
  let countDown = 3;
  let counter = setInterval(() => {
    message.channel.messages.fetch().then(messages => {
      messages
        .first()
        .edit(`${message.author} \n Race Starting in **${countDown}**`);
    });

    countDown--;
    if (countDown === 0) {
      clearInterval(counter);
      const randomIndex = Math.floor(Math.random() * questions.length);
      const questionText = questions[randomIndex].text;
      message.channel.send("Type this fast !!```" + questionText + "```");
      const hrStart = process.hrtime();

      const filter = m => m.author.id === message.author.id;
      const collector = message.channel.createMessageCollector(filter, {
        time: 50000,
      });

      let answerWords;

      collector.on("collect", msg => {
        let count = 0;
				answerWords = msg.content.split(" ");
				const questionWords = questionText.split(" ");
        for (let i = 0; i < answerWords.length; i++) {
          if (!questionWords[i]) break;
          if (answerWords[i] == questionWords[i]) count++;
        }
        let accuracy = (count / questionWords.length) * 100;
        const hrEnd = process.hrtime(hrStart);
        const seconds = `${hrEnd[0]}.${hrEnd[1].toString().slice(0, 2)}`;
				const wpm = (count/ seconds) * 60;

        if (accuracy > 80) {
          const userEmbed = {
            color: 0x0099ff,
            title: "Race Results",
            author: {
              name: message.author.username,
              icon_url: message.author.avatarURL(),
            },
            description: "Your race results are",
            fields: [
              {
                name: "Time: ",
                value: seconds,
                inline: true,
              },
              {
                name: "Accuracy",
                value: `${accuracy.toFixed(0)}%`,
                inline: true,
              },
              {
                name: "Net WPM: ",
                value: wpm.toFixed(2),
              },
            ],
          };
          message.channel.send({ embed: userEmbed });
          msg.delete();
          collector.stop();
        } else {
          message.reply(
            "Your Accuracy was too low **(" +
              accuracy.toFixed(0) +
              "%)**. Must have accuracy higher than 80%"
          );
          msg.delete();
          collector.stop();
        }
      });

      collector.on("end", collected => {
        if (!answerWords) message.reply("Noob! atleast type something");
      });
    }
  }, 1000);
};
