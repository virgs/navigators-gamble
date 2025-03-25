import { CardValues } from './card-value'
import { Link } from './link'
import { Colors } from './colors'

export type LinkedVertix = {
    vertix: Vertix
    link: Link
}

export class Vertix {
    private readonly id: string
    private readonly links: Link[]
    private cardValue?: CardValues
    private color?: Colors

    constructor(id: string, cardValue?: CardValues, color?: Colors) {
        this.id = id
        this.cardValue = cardValue
        this.color = color
        this.links = []
    }

    public linkTo(vertix: Vertix): void {
        const link = new Link(this, vertix)
        this.links.push(link)
        vertix.links.push(link)
    }

    public getId(): string {
        return this.id
    }

    public getCardValue(): CardValues | undefined {
        return this.cardValue
    }

    public setColor(color: Colors): void {
        this.color = color
    }

    public getColor(): Colors | undefined {
        return this.color
    }

    public putCard(card_value: CardValues): void {
        this.cardValue = card_value
    }

    public getLinkedVertices(): LinkedVertix[] {
        return this.links.map((link) => {
            const linkVertices = link.getVertices()
            return {
                vertix: linkVertices.find((linkVertix) => linkVertix.getId() !== this.id) as Vertix,
                link: link,
            }
        })
    }

    public getLinkedVerticesWithCardValue(): LinkedVertix[] {
        return this.getLinkedVertices().filter((linkedVertix) => linkedVertix.vertix.getCardValue() !== undefined)
    }
}
