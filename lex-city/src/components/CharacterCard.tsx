import type { Character } from '../types';

interface CharacterCardProps {
  character: Character;
  compact?: boolean;
}

export function CharacterCard({ character, compact = false }: CharacterCardProps) {
  return (
    <article className={`character-card ${compact ? 'compact' : ''}`}>
      <div className="avatar-badge">{character.emoji}</div>
      <div>
        <div className="character-title-row">
          <h3>{character.name}</h3>
          <span>{character.alias}</span>
        </div>
        <p className="muted">{character.role}</p>
        {!compact && (
          <>
            <div className="tag-row">
              {character.traits.map((trait) => (
                <span className="tag" key={trait}>{trait}</span>
              ))}
            </div>
            <p>{character.description}</p>
            <blockquote>{character.quote}</blockquote>
          </>
        )}
      </div>
    </article>
  );
}
