const Discord = require('discord.js');
const client = new Discord.Client();
const { prefix, token, papierSwitch } = require('./config.json');
const fs = require('fs');
var splitedMessageContent;
var papierSwitchLocal = papierSwitch;   

const funcArray = {
    "help": message => {
        helpArray = Object.entries(funcArray);
        console.log(helpArray[0][0]);
        let messageToSend = "```Moje komendy to: \n";

        helpArray.forEach(e => {
            messageToSend += e[0].charAt(0).toUpperCase() + e[0].slice(1);
            switch (e[0]) {
                case "help":
                    messageToSend += ": Dokładnie ta komenda";
                    break;
                case "papierz":
                    messageToSend += ": Godzina bestii nadchodzi. Pozwala zmienić jej automatyczne świętowanie";
                    break;
                case "cytat":
                    messageToSend += ": Wyświetla losowy cytat z kanału \"Cytaty\"";
                    break;
                default:
                    break;
            }
            messageToSend += "\n";
        });
        messageToSend += "```";
        message.channel.send(messageToSend);

        console.log("\nhelp - done\n");
    },
    "cytat": message => {
        const qutesChannel = message.guild.channels.cache.find(ch => ch.id == "519209835351244809");
        let messageToSend;
        qutesChannel.messages.fetch({ limit: 100 })
            .then(msg => {
                let i = 0;
                let fetchedMessage;

                if (message.mentions.users.first() != undefined) {
                    do {
                        fetchedMessage = msg.random();
                        i++;
                        if (i >= 200) {
                            message.channel.send("Nie znaleziono wiadomości napisanej przez danego użytkownika");
                            break;
                        }
                    } while (fetchedMessage.content == "" || fetchedMessage.author.id != message.mentions.users.first());
                    const createdTimestamp = new Date(fetchedMessage.createdTimestamp);
                    messageToSend = fetchedMessage.content + "\n " + createdTimestamp.toDateString();
                }
                else {
                    do {
                        fetchedMessage = msg.random();
                    } while (fetchedMessage.content == "");
                    messageToSend = fetchedMessage.content;
                    const createdTimestamp = new Date(fetchedMessage.createdTimestamp);
                    messageToSend += "\nBy: " + fetchedMessage.author.username + ", " + createdTimestamp.toDateString();
                }
                if (i < 200) {
                    message.channel.send(messageToSend);
                }
            });

        console.log("\ncytat - done\n");
    },
    "papierz": message => {
        if (papierSwitchLocal) {
            papierSwitchLocal = false;
            message.channel.send("Wyłączono");
        }
        else {
            papierSwitchLocal = true;
            message.channel.send("Włączono");
        }
        const fileName = "./config.json";
        const file = require(fileName);
        file.papierSwitch = papierSwitchLocal;
        fs.writeFile(fileName, JSON.stringify(file, null, 2), function writeJSON(err) {
            if (err) return console.log(err);
        });

        console.log("papierz - done");
    }
};

client.login(token);

client.once('ready', () => {
    console.log('Ready !\n\n');
    client.user.setActivity(prefix + "help", { type: "WATCHING" });

    setInterval(() => {
        if (papierSwitchLocal) {
            let data = new Date();
            if (data.getHours() == 21 && data.getMinutes() == 37) {
                let plebaniaGuild = client.guilds.cache.find("442264233841786880");
                let pliki = fs.readdirSync('./Resources/Papier/');
                let messegesToSend = ["Godzina bestii nadeszła !!", "2137", "Papierz z nami tańczy !!"];
                let fileToSend = "./Resources/Papier/" + pliki[Math.floor(Math.random() * pliki.length)];

                // try {
                //     message.channel.send(messegesToSend[Math.floor(Math.random() * messegesToSend.length)], { files: [fileToSend] }).catch(error => {
                //         console.log(error);
                //     });
                // }
                // catch (err) {
                //     console.log(err);
                // }
                let smietnik = plebaniaGuild.channels.cache.find(ch => ch.id == "444469291748818944");
                try {
                    smietnik.send(messegesToSend[Math.floor(Math.random() * messegesToSend.length)], { files: [fileToSend] }).catch(error => {
                        console.log(error);
                    });
                }
                catch (err) {
                    console.log(err);
                }
            }
            // else {
            //     message.channel.send("Godzina dopiero nadejdzie");
            //     console.log("Godzin: " + data.getHours());
            //     console.log("Minut: " + data.getMinutes());
            // }
        }
    }, 20000)
});

client.on('message', message => {
    if (message.content.includes(prefix)) {
        if (message.content.search(prefix) == 0 || message.author.id != client.user.id) {
            splitedMessageContent = message.content.split(" ");
            splitedMessageContent[0] = splitedMessageContent[0].slice(prefix.length, splitedMessageContent[0].length);
            if (funcArray[splitedMessageContent[0]] != undefined) {
                funcArray[splitedMessageContent[0]](message);
            }
            else {
                message.channel.send("<@" + message.author.id + "> Nie posiadam takiej komendy");
            }
        }

        console.log("Wysłane przez: " + message.author.username);
    }
});