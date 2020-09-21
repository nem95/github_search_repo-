import react, { useState } from 'react';
import { Octokit } from '@octokit/rest';

import styles from '../styles/loaderAnimation.module.css';

function Home() {
  const [owner, setOwner] = useState(null);
  const [repo, setRepo] = useState(null);
  const [commits, setCommits] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const octokit = new Octokit();

  const handleInputChange = (evt, inputName) => {
    if (inputName === 'owner') {
      setOwner(evt.target.value || null);
    } else {
      setRepo(evt.target.value || null);
    }
  }

  const handleFormSubmit = async (evt) => {
    evt.preventDefault();

    if (owner && repo) {
      setIsLoading(true);

      try {
        const { data } = await octokit.repos.get({
          owner: owner,
          repo: repo,
        });
        const res = await fetch(data.commits_url.replace('{/sha}', ''));
        const resdata = await res.json();

        setIsLoading(false);
        console.log(data);
        setCommits(resdata);
      } catch (error) {
        setCommits(null);
        setIsLoading(false);
        console.log(error);
      }
    };
  }

  const formatDate = (date) => {
    return new Intl.DateTimeFormat('fr-FR', {
      formatMatcher: 'best fit',
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit'
    }).format(new Date(date));
  }

  return (
    <div className={classNames.container}>
      <form className="w-full lg:w-1/2 mx-auto bg-orange-200 p-5 border" onSubmit={(e) => handleFormSubmit(e)}>
        <div className="flex flex-wrap -mx-3 mb-0 md:mb-6">
          <div className="w-full md:w-1/3 px-3 mb-6 md:mb-0">
            <label className={classNames.label} htmlFor="owner">
              GitHub User
            </label>
            <input
              type="text"
              name="owner"
              id="owner"
              onChange={(e) => handleInputChange(e, 'owner')}
              value={owner || ''}
              className={classNames.input}
            />
          </div>
          <div className="w-full md:w-1/3 px-3 d-flex">
            <label className={classNames.label} htmlFor="repo">
              User Repository
            </label>

            <input
              type="text"
              id="repo"
              name="repo"
              onChange={(e) => handleInputChange(e, 'repo')}
              value={repo || ''}
              className={classNames.input}
            />
          </div>

          <div className="flex w-full md:w-1/3 px-3 my-3 md:my-0 items-end">
            <div className="w-full">
              <button className={classNames.searchButton} type="submit">
                Rechercher
              </button>
            </div>
          </div>
        </div>
      </form>

      <br />

      <div className="flex w-full flex-col items-center">
        {commits && commits.map((com, i) => {
          const { commit, committer } = com;

          return (
            <div className="flex w-full lg:w-1/2 my-4 items-center" key={i.toString()}>
              <div className="md:flex-shrink-0 flex items-center mr-2">
                <img className="rounded-lg md:w-20" src={committer.avatar_url} width="48" height="48" alt="Woman paying for a purchase" />
              </div>
              <div className="mt-4 md:mt-0 md:ml-6">
                <a
                  href={com.html_url}
                  className={classNames.commit_message}
                  target="_blank"
                >
                  {commit.message}
                </a>

                <p className="mt-2 text-gray-600">
                  Le {formatDate(commit.author.date)} | &nbsp;
                  <span className="text-sm">
                    ID: <a href={com.html_url} target="_blank" className="hover:underline break-all">{com.sha}</a>
                  </span>
                </p>
              </div>
            </div>
          );
        })}
      </div>
      {isLoading && (
        <div className="flex w-full items-center h-64">
          <div id={styles['wave-container']} className="wave-container w-full">
            {[...Array(10).fill(0)].map((item, i) => (
              <div class={styles.dot} id={styles[`d${i + 1}`]}></div>
            ))}
          </div>
        </div>
        )}

    </div>
  )
}

const classNames = {
  container: 'container md:mx-auto mt-5 px-5',
  input: 'bg-white focus:outline-none focus:shadow-outline border border-gray-300 rounded-lg py-2 px-4 block w-full appearance-none leading-normal',
  searchButton: 'w-full shadow bg-green-400 hover:bg-green-600 focus:shadow-outline focus:outline-none text-white font-bold py-2 px-4 rounded',
  label: 'block uppercase tracking-wide text-gray-700 text-xs font-bold mb-2',
  commit_message: 'block mt-1 text-lg leading-tight font-semibold text-gray-900 hover:underline capitalize',
}

export default Home;
