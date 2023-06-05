import { EmbedBuilder, TextChannel, VoiceChannel } from "discord.js";
import Command from "../utils/discord/commandHandler";
import dailyMessageScheme from "../schemes/dailyMessageScheme";

export default new Command({
    name: "daily-message-remove",
    description: "Remove a daily message",
    permissions: ["MANAGE_CHANNELS"],
    options: [
        {
            name: "id",
            description: "The message id to remove",
            type: "string"
        }
    ],
    async run(interaction) {
        const id = interaction.options.get("id", true) as { value: string };
        const dailyMessage = await dailyMessageScheme.findOne({ guildID: interaction.guildId, _id: id.value });
        if(dailyMessage === null) {
            const noDailyMessageEmbed = new EmbedBuilder()
                .setTitle("No daily message found")
                .setDescription("No daily message found with the given parameters")
                .setColor("Red")
            interaction.reply({ embeds: [noDailyMessageEmbed] })
            return
        }
        await dailyMessage.deleteOne();
        const dailyMessageRemovedEmbed = new EmbedBuilder()
            .setTitle("Daily message removed")
            .setDescription("The daily message has been removed")
            .setColor("Green")
        interaction.reply({ embeds: [dailyMessageRemovedEmbed] })
        console.log(`Removed daily message with id ${id.value} from the channel ${dailyMessage.channelName} in the guild ${interaction.guildId}`)
    }
})