import { aboutDetails } from '../data/content';
import { site } from '../data/site';
import { ScrubText } from './ScrubText';
import { SectionHead } from './SectionHead';

export function About() {
  return (
    <section id="about" className="section section-about" aria-labelledby="about-title">
      <SectionHead num="01" label="About" id="about-title">
        Turning Ideas Into <em>Intelligent</em> Systems.
      </SectionHead>

      <div className="about-bento">
        <div className="tile tile-bio" data-reveal="">
          <span className="tile-label">// profile.summary</span>
          <ScrubText className="bio-lead">
            {`I'm Mohamed Sahal, an AI Engineer and Data Scientist with a BTech in Computer Science and Engineering. I
            work across machine learning, data science and generative AI, and I care most about one thing: getting
            models out of notebooks and into systems people can actually use.`}
          </ScrubText>
          <p className="body-text">
            My work spans emergency response platforms with voice AI, healthcare monitoring software, computer vision
            with transfer learning, and LLM assistants built on retrieval-augmented generation. It is grounded in formal
            AI Engineering training, the Google Advanced Data Analytics certificate, and an eight-month AI engineering
            internship at Rubixe working on proof-of-concept and client-oriented projects.
          </p>
        </div>

        <Portrait />

        <dl className="about-facts">
          {aboutDetails.map((d, i) => (
            <div key={d.key} className={d.accent ? 'tile tile-fact is-accent' : 'tile tile-fact'} data-reveal={i * 70}>
              <dt>{d.key}</dt>
              <dd>{d.value}</dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}

/** Rectangular portrait hung from a wire, in black and white, with the name set on the photo. */
function Portrait() {
  return (
    <figure className="tile tile-portrait" data-reveal="100">
      <div className="portrait-hang">
        <span className="portrait-wire" aria-hidden="true" />
        <div className="portrait-frame">
          <div className="portrait-photo">
            <img src={site.photo} alt={`Portrait of ${site.name}`} width={213} height={272} />
            <figcaption className="portrait-cap">
              <span className="portrait-name">{site.name}</span>
              <span className="portrait-role">AI Engineer · Data Scientist</span>
            </figcaption>
          </div>
        </div>
      </div>
      <span className="portrait-status">
        <span className="status-dot" aria-hidden="true" />
        Open to opportunities
      </span>
    </figure>
  );
}
