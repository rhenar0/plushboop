/* Discord.js Packages */

const Discord = require("discord.js")
const client = new Discord.Client();
const {
    prefix,
    token,
} = require('./config.json');
const ytdl = require('ytdl-core');

// Variable //
const queue = new Map();

/* Reaction Role Packages */
const ReactionRole = require("reaction-role");
const reactionRole = new ReactionRole(token);

let option1 = reactionRole.createOption("✅", "725778994477400174");
reactionRole.createMessage("725802691212738571", "725779561010167811", true, option1);

reactionRole.init();

client.login(token);


// Evenements systèmes //

client.once('ready', () => {
    console.log('[PLUSH] Système en ligne !');
    console.log('[PLUSH] Module - {ReactionRole}')
    console.log('[PLUSH] Module - {YoutubeMusic}')
});
client.once('reconnecting', () => {
    console.log('[PLUSH] Reconnexion en cours...');
});
client.once('disconnect', () => {
    console.log('[PLUSH] Système deconnecté !');
});

client.on('message', async message => {
    if (message.author.bot) return;
    if (!message.content.startsWith(prefix)) return;

    const serverQueue = queue.get(message.guild.id);
    if (message.content.startsWith(`${prefix}play`)) {
        execute(message, serverQueue);
        return;
    } else if (message.content.startsWith(`${prefix}skip`)) {
        skip(message, serverQueue);
        return;
    } else if (message.content.startsWith(`${prefix}stop`)) {
        stop(message, serverQueue);
        return;
    } else {
        message.channel.send("Commande inconnue !");
    }
})

// Fonctions //

async function execute(message, serverQueue) {
    const args = message.content.split(" ");

    const voiceChannel = message.member.voice.channel;
    if (!voiceChannel)
        return message.channel.send(
            "Vous devez être connecté dans un channel vocal pour pouvoir mettre de la musique !"
        );
    const permissions = voiceChannel.permissionsFor(message.client.user);
    if (!permissions.has("CONNECT") || !permissions.has("SPEAK")) {
        return message.channel.send(
            "Je dois avoir les permissions de rejoindre et de parler dans le channel vocal pour pouvoir jouer de la musique !"
        );
    }

    const songInfo = await ytdl.getInfo(args[1]);
    const song = {
        title: songInfo.title,
        url: songInfo.video_url,
    };

    if (!serverQueue) {

    } else {
        serverQueue.songs.psuh(song);
        console.log(serverQueue.songs);
        return message.channel.send(`${song.title} a été ajouter à la liste d'attente !`);
    }

    const queueConstruct = {
        textChannel: message.channel,
        voiceChannel: voiceChannel,
        connection: null,
        songs: [],
        volume: 5,
        playing: true,
    };

    queue.set(message.guild.id, queueConstruct);
    queueConstruct.songs.push(song);

    try {
        var connection = await voiceChannel.join();
        queueConstruct.connection = connection;
        play(message.guild, queueConstruct.songs[0]);
    } catch (err) {
        console.log(err);
        queue.delete(message.guild.id);
        return message.channel.send(err);
    }
}

function play(guild, song) {
    const serverQueue = queue.get(guild.id);
    if (!song) {
        serverQueue.voiceChannel.leave();
        queue.delete(guild.id);
        return;
    }
    const dispatcher = serverQueue.connection
        .play(ytdl(song.url))
        .on("finish", () => {
            serverQueue.songs.shift();
            play(guild, serverQueue.songs[0]);
        })
        .on("error", error => console.error(error));
    dispatcher.setVolumeLogarithmic(serverQueue.volume / 5)
    serverQueue.textChannel.send(`Lecture de : **${song.title}**`)
}

function skip(message, serverQueue) {
    if (!message.member.voice.channel)
        return message.channel.send(
            "Vous devez être dans le salon où je me trouve pour arréter la musique !"
        );
    if (!serverQueue)
        return message.channel.send("Il n'y a rien à skip !")
    serverQueue.connection.dispatcher.end();
}

function stop(message, serverQueue) {
    if (!message.member.voice.channel)
        return message.channel.send(
            "Vous devez être dans le salon où je me trouve pour arréter la musique !"
        );
    serverQueue.songs = [];
    serverQueue.connection.dispatcher.end();
}