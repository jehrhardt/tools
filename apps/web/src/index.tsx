/* @refresh reload */
import { RepoContext } from "@automerge/automerge-repo-solid-primitives";
import { Router } from "@solidjs/router";
import { render } from "solid-js/web";
import App from "./App.tsx";
import { repo } from "./repo";
import "./index.css";

const root = document.getElementById("root");

render(
  () => (
    <RepoContext.Provider value={repo}>
      <Router>
        <App />
      </Router>
    </RepoContext.Provider>
  ),
  root!,
);
