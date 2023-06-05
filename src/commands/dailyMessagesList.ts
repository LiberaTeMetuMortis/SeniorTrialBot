import { EmbedBuilder } from "discord.js";
import Command from "../utils/discord/commandHandler";
import dailyMessageScheme from "../schemes/dailyMessageScheme";
export default new Command({
    name: "daily-messages-list",
    description: "List all daily messages",
    permissions: ["MANAGE_CHANNELS"],
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
        const dailyMessages = await dailyMessageScheme.find({ guildID: interaction.guildId });
        if (dailyMessages.length === 0) {
            const noDailyMessagesEmbed = new EmbedBuilder()
                .setTitle("No daily messages")
                .setDescription("There are no daily messages in this guild")
                .setColor("Red")
            interaction.reply({ embeds: [noDailyMessagesEmbed] })
            return
        }
        const dailyMessagesEmbed = new EmbedBuilder()
            .setTitle("Daily messages")
            .setDescription("Here are all the daily messages in this guild")
            .setColor("Green")

        for(const dailyMessage of dailyMessages) {
            const channel = await guild.channels.fetch(dailyMessage.channelID!)
            if(channel) {
                console.log("Channel found")
                dailyMessagesEmbed.addFields({name: `${channel.name} at ${dailyMessage.hour}:${dailyMessage.minute}`, value: `ID: ${dailyMessage._id} \n Message: ${dailyMessage.message}`})
            }
        }
        console.log("Embed sent")
        interaction.reply({ embeds: [dailyMessagesEmbed] })
    }
})