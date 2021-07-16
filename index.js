const Discord = require("discord.js");
const client = new Discord.Client();
const fs = require('fs');
const { prefix, token } = require("./config.json");
const SQLite = require("better-sqlite3");
const sql = new SQLite("./rpgdata.sqlite");
const cron = require('node-cron');

client.on("ready", () => {
    console.log(`${client.user.tag} Ready!`);
    client.user.setActivity("sh help", {
        type: 'PLAYING',
    })

    // const table = sql.prepare("SELECT count(*) FROM sqlite_master WHERE type='table' AND name = 'scores';").get();
    // if (!table['count(*)']) {
    //     sql.prepare("CREATE TABLE scores (id TEXT PRIMARY KEY, user TEXT, guild TEXT, points INTEGER, level INTEGER);").run();
    //     sql.prepare("CREATE UNIQUE INDEX idx_scores_id ON scores (id);").run();
    //     sql.pragma("synchronous = 1");
    //     sql.pragma("journal_mode = wal");
    // }

    // client.getScore = sql.prepare("SELECT * FROM scores WHERE user = ? AND guild = ?");
    // client.setScore = sql.prepare("INSERT OR REPLACE INTO scores (id, user, guild, points, level) VALUES (@id, @user, @guild, @points, @level);");

    const erpgdata = sql.prepare("SELECT count(*) FROM  sqlite_master WHERE type='table' AND name = 'rpgdata';").get();
    if (!erpgdata['count(*)']) {
        sql.prepare("CREATE TABLE rpgdata (id TEXT PRIMARY KEY, user TEXT, guild TEXT, hunts INTEGER, worker INTEGER, adventure INTEGER, farm INTEGER);").run();
        sql.prepare("CREATE UNIQUE INDEX idx_rpgdata_id ON rpgdata (id);").run();
        sql.pragma("synchronous = 1");
        sql.pragma("journal_mode = wal");
    }

    client.getCount = sql.prepare("SELECT * FROM rpgdata WHERE user = ? AND guild = ?");
    client.setCount = sql.prepare("INSERT OR REPLACE INTO rpgdata (id, user, guild, hunts, worker, adventure, farm) VALUES (@id, @user, @guild, @hunts, @worker, @adventure, @farm);");

});

cron.schedule('59 23 * * *', () => {
    client.delete = sql.prepare("DELETE FROM rpgdata");
    client.delete.run();
})

client.on("message", async (message) => {
    if (message.author.bot) return;
    
    let rpgcount;
    let con = message.content.toLowerCase();
    if (message.guild) {
        rpgcount = client.getCount.get(message.author.id, message.guild.id);
        if (!rpgcount) {
            rpgcount = { id: `${message.guild.id}-${message.author.id}`, user: message.author.id, guild: message.guild.id, hunts: 0, worker: 0, adventure: 0, farm: 0 }
        }
    
    }
    
    if (con.startsWith('rpg')) { //counters
        const filter = m => m.author.id == 555955826880413696
        
        const collector = message.channel.createMessageCollector(filter, {
            max: 1,
            time: 15000,
            errors: ['time'],
        })
        
        
        
        collector.on('collect', msg => {
            
            if (con.includes('hunt')) {
                if (msg.embeds.length) 
                    return;
                if (msg.content.includes("what command are you trying to use?"))
                    return;
                if (msg.content.includes("end your previous command"))
                    return;
                if (msg.content.includes("you can't do this"))
                    return;
                rpgcount.hunts++;  
                
            }
            else if ((con.includes('chop') || con.includes('axe') || con.includes('bowsaw') || con.includes('chainsaw') || con.includes('fish') || con.includes('net') || con.includes('boat') || con.includes('bigboat') || con.includes('pickup') || con.includes('ladder') || con.includes('tractor') || con.includes('greenhouse') || con.includes('mine') || con.includes('pickaxe') || con.includes('drill') || con.includes('dynamite'))) {
                if (msg.embeds.length)
                    return ;
                if (msg.content.includes("what command are you trying to use?"))
                    return;
                if (msg.content.includes("end your previous command"))
                    return;
                if (msg.content.includes("you can't do this"))
                    return;
                rpgcount.worker++;

            }
            else if (con.includes('adv') || con.includes('adventure')) {
                if (msg.embeds.length)
                    return;
                if (msg.content.includes("what command are you trying to use?"))
                    return;
                if (msg.content.includes("end your previous command"))
                    return;
                if (msg.content.includes("you can't do this"))
                    return;
                rpgcount.adventure++;
            }
            else if (con.includes('farm')) {
                if (msg.embeds.length)
                    return;
                if (msg.content.includes("what command are you trying to use?"))
                    return;
                if (msg.content.includes("end your previous command"))
                    return;
                if (msg.content.includes("you can't do this"))
                    return;
                if (msg.content.includes("what seed are you trying to use?"))
                    return;
                if (msg.content.includes("you do not have this type of seed"))
                    return;
                if (msg.content.includes("seed to farm"))
                    return;

                rpgcount.farm++;
                
            }
            client.setCount.run(rpgcount);
        })
    } 

   
    

    // let score;
    // if (message.guild) {
    //     score = client.getScore.get(message.author.id, message.guild.id);
    //     if (!score) {
    //         score = { id: `${message.guild.id}-${message.author.id}`, user: message.author.id, guild: message.guild.id, points: 0, level: 0 }
    //     }   
    // }

    // score.points++;
    
    // const curLevel = Math.floor(0.1* Math.sqrt(score.points));

    // if (score.level < curLevel) {
    //     score.level++;
    //     message.reply(`You've leveled up to level **${curLevel}**!`);
    // }
    
    // client.setScore.run(score);

    if (message.content.indexOf(prefix) !== 0) return;
	const args = message.content.slice(prefix.length).trim().split(/ +/);
    const command = args.shift().toLowerCase();

    if (command === 'help') {
        if (args[0] === undefined) 
        {
            const helpembed = new Discord.MessageEmbed()
                .setColor(0x00AE86)
                .setTitle('Pendragon | Help | prefix: `sh`')
                .setDescription('For additional info on a command, use `sh help <command name>`')
                .addFields(
                    {name: 'Commands', value: '`help`, `stats`, `rpgl`'}
                )
                .setFooter('By Iwatani Naofumi#9712')
            message.channel.send(helpembed)
        }
        else {
            fs.readFile('./helpdata.json', 'utf8', (err, data) => {

                if (err) {
                    console.log(`Error reading file from disk: ${err}`);
                } else {
            
                    // parse JSON string to JSON object
                    const hdata = JSON.parse(data);
            
                    
                    hdata.forEach(db => {
                        if (args[0] === db.name) {
                            const embed = new Discord.MessageEmbed()
                                .setColor('#4CC5C8')
                                .setTitle(`${db.title}`)
                                .setDescription(`${db.description}`)
                                .addField("Usage", `${db.value}` )
                            message.channel.send(embed)
                        }
                    });
                }
            
            });
        }
    }
    if (command === 'stats') {

        let crusaderVal;
        let crusader = message.member.roles.cache.find(role => role.id === '826475830388457522');
        if (crusader !== undefined) {
            crusaderVal = "<:shinystar:789852176218456085> Special Giveaways Bonus Enabled";
        } 
        else { crusaderVal = "<:shinystar:789852176218456085> Special Giveaways Bonus Disabled";}
        let total = rpgcount.hunts + rpgcount.worker + rpgcount.adventure + rpgcount.farm;
        const embed = new Discord.MessageEmbed()
            .setColor(0x00AE86)
            .setAuthor(message.author.username, message.author.avatarURL())
            .setTitle(`Statistics for ${message.author.username}`)
            .addFields(
                {name: 'Commands', value: `**Today**: ${total}\n**Hunts**: ${rpgcount.hunts} | **Worker**: ${rpgcount.worker} | **Adventure**: ${rpgcount.adventure} | **Farm**: ${rpgcount.farm}`, inline: true},
                {name: 'Crusader', value: `${crusaderVal}`}
            )
            .setTimestamp()
        message.channel.send({ embed });
    }

    if (command === 'rpgl') {
        const top10r = sql.prepare("SELECT * FROM rpgdata WHERE guild = ? ORDER BY hunts DESC LIMIT 5;").all(message.guild.id);
      
          
        const embed = new Discord.MessageEmbed()
          .setTitle("Leaderboard")
          .setAuthor(client.user.username, client.user.displayAvatarURL())
          .setDescription("Today's leaderboard")
          .setColor(0x00AE86);
        
        for (const rdata of top10r) {
            let total = rdata.hunts + rdata.worker + rdata.adventure + rdata.farm;
            const user = await client.users.fetch(rdata.user);
            if (!user) continue ; //this is in case user isnt found
            const tag = user.tag;
            embed.addFields({ name: `${tag} | ${total}`, value: `**hunts**: ${rdata.hunts}\n**worker**: ${rdata.worker}\n**Adventure**: ${rdata.adventure}\n**Farm**: ${rdata.farm}`});
        } 

        return message.channel.send({ embed });
    }
    
    

    

    
    // if (command === 'points') {
    //     const embed = new Discord.MessageEmbed()
    //         .setColor(0x00AE86)
    //         .setTitle(`Rewards for ${message.author.username}`)
    //         .setThumbnail(message.author.avatarURL())
    //         .addFields(
    //             {name:'Points', value: `${score.points}`},
    //             {name: 'Level', value: `${score.level}`}
    //         )
    //         .setTimestamp()
    //     message.channel.send(embed);
    // }

    // if (command === 'give') {
    //     if (!message.author.id === message.guild.owner) return message.reply("You are not my boss, so you can't do that.");

    //     const user = message.mentions.users.first() || client.users.cache.get(args[0]);
    //     if (!user) return message.reply("You must mention someone of give their ID!\nusage: `sh give @user <amount>`");

    //     const pointsToAdd = parseInt(args[1], 10);
    //     if(!pointsToAdd) return message.reply("You must specify how many points to give...\nusage: `sh give @user <amount>`");

    //     let userscore = client.getScore.get(user.id, message.guild.id);

    //     if (!userscore) {
    //         userscore = { id: `${message.guild.id}-${user.id}`, user: user.id, guild: message.guild.id, points: 0, level: 0 }

    //     }
    //     userscore.points += pointsToAdd;

    //     let userLevel = Math.floor(0.1 * Math.sqrt(score.points));
    //     userscore.level = userLevel;

    //     client.setScore.run(userscore);

    //     return message.channel.send(`${user.tag} has received ${pointsToAdd} points and now stands at ${userscore.points} points.`);
    // }

    // if (command === 'remove') {
    //     if (!message.author.id === message.guild.owner) return message.reply("You are not my boss, so you can't do that.");

    //     const user = message.mentions.users.first() || client.users.cache.get(args[0]);
    //     if (!user) return message.reply("You must mention someone of give their ID!\nusage: `sh remove @user <amount>`");

    //     const pointsToRemove = parseInt(args[1], 10);
    //     if(!pointsToRemove) return message.reply("You must specify how many points to remove...\nusage: `sh remove @user <amount>`");

    //     let userscore = client.getScore.get(user.id, message.guild.id);

    //     if (!userscore) {
    //         userscore = { id: `${message.guild.id}-${user.id}`, user: user.id, guild: message.guild.id, points: 0, level: 0 }

    //     }
    //     userscore.points -= pointsToRemove;

    //     let userLevel = Math.floor(0.1 * Math.sqrt(score.points));
    //     userscore.level = userLevel;

    //     client.setScore.run(userscore);

    //     return message.channel.send(`${user.tag} has lost ${pointsToRemove} points and now stands at ${userscore.points} points.`);
    // }

    // if(command === "leaderboard") {
    //     const top10 = sql.prepare("SELECT * FROM scores WHERE guild = ? ORDER BY points DESC LIMIT 10;").all(message.guild.id);
      
    //       // Now shake it and show it! (as a nice embed, too!)
    //     const embed = new Discord.MessageEmbed()
    //       .setTitle("Leaderboard")
    //       .setAuthor(client.user.username, client.user.displayAvatarURL())
    //       .setDescription("Our top 10 points leaders!")
    //       .setColor(0x00AE86);
      
    //     for(const data of top10) {
    //       embed.addFields({ name: client.users.cache.get(data.user).tag, value: `${data.points} points (level ${data.level})` });
    //     }
    //     return message.channel.send({ embed });
    //   }
    

});

client.login(token);