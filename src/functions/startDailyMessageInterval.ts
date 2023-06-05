import { Client, Guild, TextChannel } from "discord.js";

export default async function startDailyMessageInterval(client: Client, guildID: string, channelID: string, messageData: {message: string, hour: number, minute: number}) {
    const firstTimeToSendMessage = new Date();
    firstTimeToSendMessage.setHours(messageData.hour);
    firstTimeToSendMessage.setMinutes(messageData.minute);
    firstTimeToSendMessage.setSeconds(0);
    firstTimeToSendMessage.setMilliseconds(0);
    let timeUntilFirstMessage = firstTimeToSendMessage.getTime() - Date.now();
    if(timeUntilFirstMessage < 0) {
        timeUntilFirstMessage += 24 * 60 * 60 * 1000;
    }
    setTimeout(async () => {
        const guild = await client.guilds.fetch(guildID);
        if(guild === null) return
        const channel = await guild.channels.fetch(channelID);
        if(channel === null) return
        await (channel as TextChannel).send(messageData.message); // Send the message
        setInterval(async () => { // Set interval to send the message every 24 hours
            const guild = await client.guilds.fetch(guildID); // Fetch the guild again
            if(guild === null) return
            const channel = await guild.channels.fetch(channelID); // Fetch the channel again
            if(channel !== null) { // Check if channel still exists
                await (channel as TextChannel).send(messageData.message); // Send the message
            }
        }, 24 * 60 * 60 * 1000);
        
    }, timeUntilFirstMessage);
}