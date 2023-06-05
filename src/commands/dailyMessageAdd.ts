import { TextChannel } from "discord.js";
import startDailyMessageInterval from "../functions/startDailyMessageInterval";
import Command from "../utils/discord/commandHandler";
import { VoiceChannel } from "discord.js";
import { EmbedBuilder } from "discord.js";
import dailyMessageScheme from "../schemes/dailyMessageScheme";
export default new Command({
    name: "daily-message-add",
    description: "Add a daily message",
    permissions: ["MANAGE_CHANNELS"],
    options: [
        {
            name: "message",
            description: "The message to send",
            type: "string"
        },
        {
            name: "channel",
            description: "The channel to send the message in",
            type: "channel"
        },
        {
            name: "time",
            description: "The time to send the message example: 16:45",
            type: "string"
        }
    ],
    async run(interaction) {
        const guild = interaction.guild;
        if (guild === null) {
            const noGuildEmbed = new EmbedBuilder()
                .setTitle("No guild")
                .setDescription("You must be in a guild to use this command")
                .setColor("Red")
            interaction.reply({ embeds: [noGuildEmbed] })
            return
        }
        const time = interaction.options.get("time", true) as { value: string };
        if(!time.value.match(/^\d{2}:\d{2}$/)) {
            const invalidTimeFormatEmbed = new EmbedBuilder()
                .setTitle("Invalid time format")
                .setDescription("The time format must be HH:MM (e.g., 16:45)")
                .setColor("Red")
            interaction.reply({ embeds: [invalidTimeFormatEmbed] })
            return
        }
        const message = interaction.options.get("message", true) as { value: string };
        const { channel } = interaction.options.get("channel", true) as { channel: TextChannel | VoiceChannel };
        
        if(channel instanceof VoiceChannel) {
            const invalidChannelEmbed = new EmbedBuilder()
                .setTitle("Invalid channel")
                .setDescription("You can't send a message in a voice channel")
                .setColor("Red")
            interaction.reply({ embeds: [invalidChannelEmbed] })
            return
        }
            
        const [hour, minute] = time.value.split(":").map(str => parseInt(str));
        if (hour > 23 || hour < 0) {
            const invalidTimeFormatEmbed = new EmbedBuilder()
                .setTitle("Invalid time format")
                .setDescription("The time format must be HH:MM (e.g., 16:45)")
                .setColor("Red")
            interaction.reply({ embeds: [invalidTimeFormatEmbed] })
            return
        }

        if (minute > 59 || minute < 0) {
            const invalidTimeFormatEmbed = new EmbedBuilder()
                .setTitle("Invalid time format")
                .setDescription("The time format must be HH:MM (e.g., 16:45)")
                .setColor("Red")
            interaction.reply({ embeds: [invalidTimeFormatEmbed] })
            return
        }
        const guildID = guild.id;
        const channelName = channel.name;
        const channelID = channel.id;
        const messageData = {
            guildID,
            channelName,
            channelID,
            message: message.value,
            hour,
            minute
        };
        await dailyMessageScheme.create(messageData);
        const successEmbed = new EmbedBuilder()
            .setTitle("Success!")
            .setDescription(`The message will be sent in ${channelName} at ${hour}:${minute}`)
            .setColor("Green")
        interaction.reply({ embeds: [successEmbed] })

        startDailyMessageInterval(interaction.client, guildID, channelID, messageData)
        console.log(`Added new daily message for guild ${guildID} in channel ${channelID} at ${hour}:${minute}`)
    }
})
