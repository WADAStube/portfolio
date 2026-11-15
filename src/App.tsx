import { Switch, Route, Redirect } from "wouter";
import { LanguageProvider } from "@/lib/lang";
import Home from "@/pages/Home";
import Projects from "@/pages/Projects";
import ProjectDetail from "@/pages/ProjectDetail";
import Engineering from "@/pages/Engineering";
import About from "@/pages/About";
import NotFound from "@/pages/not-found";

export default function App() {
  return (
    <LanguageProvider>
      <Switch>
        <Route path="/" component={Home} />
        <Route path="/projects" component={Projects} />
        <Route path="/projects/:slug" component={ProjectDetail} />
        <Route path="/engineering" component={Engineering} />
        <Route path="/about" component={About} />

        {/* Alte Adressen aus der Dreiteilung 3D / Apps / Design */}
        <Route path="/apps">
          <Redirect to="/projects?focus=software" replace />
        </Route>
        <Route path="/design">
          <Redirect to="/projects?focus=design" replace />
        </Route>

        <Route component={NotFound} />
      </Switch>
    </LanguageProvider>
  );
}
