import React from "react";
import Body from '../components/body';
import { ExternalLink } from 'react-external-link';

function Home(){

  return (
    <Body content={ 
    <div className="home_layout">
      <div className="project">
        <div className="project_title">
          <p>Welcome to our</p>
          <p>ft_transcendence : </p>
          <ExternalLink href="https://42.fr/en/homepage/" >
            <div className="home_logo">
              <img src="/images/logos/42_logo.png"/>
            </div>
          </ExternalLink> 
          <p>'s final </p>
          <p>common-core project</p>
        </div>
        <div className="stack_infos">
          Stack : 
          <ExternalLink href="https://www.typescriptlang.org/" >
            <div className="avatar_medium">
              <img src="/images/logos/Typescript_logo.png"/>
            </div>
          </ExternalLink>
          <ExternalLink href="https://nestjs.com/" >
            <div className="avatar_medium">
              <img src="/images/logos/nestjs_logo.jpeg"/>
            </div>
          </ExternalLink>
          <ExternalLink href="https://nextjs.org//" >
            <div className="avatar_medium">
              <img src="/images/logos/nextjs-logo.png"/>
            </div>
          </ExternalLink>
          <ExternalLink href="https://reactjs.org/" >
            <div className="avatar_medium">
              <img src="/images/logos/React-icon.png"/>
            </div>
          </ExternalLink>
          <ExternalLink href="https://nodejs.org/en/" >
            <div className="avatar_medium">
              <img src="/images/logos/nodejs_logo.png"/>
            </div>
          </ExternalLink>
          <ExternalLink href="https://www.postgresql.org/" >
            <div className="avatar_medium">
              <img src="/images/logos/postgres_logo.png"/>
            </div>
          </ExternalLink>
          <ExternalLink href="https://www.docker.com/" >
            <div className="avatar_medium">
              <img src="/images/logos/docker_logo.png"/>
            </div>
          </ExternalLink>
        </div>
      </div>
      <div className="team">
        <div className="team_title">
          The team
        </div>
        <div className="team_infos">
          <div className="team_user_infos">
            <div className="user_infos_avatar">
              <div className="avatar_medium">
                <img src={'/images/team/aduchemi.jpeg'} alt="profile picture" layout="fill" />
              </div>
            </div>
            <div className="team_user_infos_login">
                <p>Alice Duchemin</p>
                <p>(aduchemi)</p>
                <p>aduchemi@student.42.fr</p>
                <ExternalLink href="https://github.com/aliceduchemin" >
                  <div className="avatar_small">
                    <img src="/images/logos/github_logo.png"/>
                  </div>
                </ExternalLink>
            </div>
          </div>
          <div className="team_user_infos">
            <div className="user_infos_avatar">
              <div className="avatar_medium">
                <img src={'/images/team/akerloc-.jpeg'} alt="profile picture" layout="fill" />
              </div>
            </div>
            <div className="team_user_infos_login">
                <p>Alban Kerloc'h</p>
                <p>(akerloc-)</p>
                <p>akerloc-@student.42.fr</p>
                <ExternalLink href="https://github.com/albankerloch" >
                  <div className="avatar_small">
                    <img src="/images/logos/github_logo.png"/>
                  </div>
                </ExternalLink>
            </div>
          </div>
          <div className="team_user_infos">
            <div className="user_infos_avatar">
              <div className="avatar_medium">
                <img src={'/images/team/alienard.jpeg'} alt="profile picture" layout="fill" />
              </div>
            </div>
            <div className="team_user_infos_login">
                <p>Alexandre Lienard</p>
                <p>(alienard)</p>
                <p>alienard@student.42.fr</p>
                <ExternalLink href="https://github.com/lienardale" >
                  <div className="avatar_small">
                    <img src="/images/logos/github_logo.png"/>
                  </div>
                </ExternalLink>
            </div>
          </div>
          <div className="team_user_infos">
            <div className="user_infos_avatar">
              <div className="avatar_medium">
                <img src={'/images/team/jdussert.jpeg'} alt="profile picture" layout="fill" />
              </div>
            </div>
            <div className="team_user_infos_login">
                <p>Jehanne Dussert</p>
                <p>(jdussert)</p>
                <p>jdussert@student.42.fr</p>
                <ExternalLink href="hhttps://github.com/JehanneDussert">
                  <div className="avatar_small">
                    <img src="/images/logos/github_logo.png"/>
                  </div>
                </ExternalLink>
            </div>
          </div>
          <div className="team_user_infos">
            <div className="user_infos_avatar">
              <div className="avatar_medium">
                <img src={'/images/team/pcariou.jpeg'} alt="profile picture" layout="fill" />
              </div>
            </div>
            <div className="team_user_infos_login">
                <p>Pierre Cariou</p>
                <p>(pcariou)</p>
                <p>pcariou@student.42.fr</p>
                <ExternalLink href="https://github.com/pierrecariou">
                  <div className="avatar_small">
                    <img src="/images/logos/github_logo.png"/>
                  </div>
                </ExternalLink>
            </div>
          </div>
        </div>
      </div>
    </div>
    }
    />
  )
}
 
export default Home;