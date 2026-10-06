/**
 * DashboardPreview — mock dashboard frame showing the Relay app interface.
 * Includes sidebar navigation, stats, projects, activity pulse, and ask input.
 */

import {
  ArrowRight,
  ArrowUpRight,
  BookOpen,
  Boxes,
  CircleDot,
  GitPullRequest,
  MessageCircle,
  ScanLine,
  Search,
  SquareTerminal,
  Zap,
} from "lucide-react";
import { RelayMark } from "../parts";

export function DashboardPreview() {
  return (
    <div className="dashboard-frame" aria-hidden="true">
      <div className="dashboard-sidebar">
        <RelayMark compact />
        <div className="dash-nav">
          <span className="dash-nav-active">
            <SquareTerminal size={14} /> Home
          </span>
          <span>
            <Boxes size={14} /> Projects
          </span>
          <span>
            <Search size={14} /> Search
          </span>
          <span>
            <BookOpen size={14} /> Onboarding
          </span>
          <span>
            <GitPullRequest size={14} /> Handoff
          </span>
        </div>
        <span className="dash-settings">
          <Zap size={13} /> Pro workspace
        </span>
      </div>
      <div className="dashboard-main">
        <div className="dash-top">
          <div>
            <span className="mini-label">MONDAY, OCTOBER 06</span>
            <h3>
              Good to see you, Abhi<span className="copper-dot">.</span>
            </h3>
          </div>
          <div className="avatar">A</div>
        </div>
        <div className="dash-stats">
          <div>
            <b>03</b>
            <span>Projects</span>
          </div>
          <div>
            <b>14</b>
            <span>Open threads</span>
          </div>
          <div>
            <b>02</b>
            <span>Active handoffs</span>
          </div>
          <div>
            <b>87%</b>
            <span>Context coverage</span>
          </div>
        </div>
        <div className="dash-content-grid">
          <div className="recent-projects">
            <div className="dash-section-head">
              <span>Recent projects</span>
              <span className="dash-view-all">
                View all <ArrowUpRight size={12} />
              </span>
            </div>
            <div className="project-row">
              <div className="project-icon project-icon-copper">S</div>
              <div>
                <b>Spawn</b>
                <span>AbhiXO / Spawn</span>
              </div>
              <em>Healthy</em>
              <small>4h ago</small>
            </div>
            <div className="project-row">
              <div className="project-icon project-icon-blue">P</div>
              <div>
                <b>Preflight</b>
                <span>AbhiXO / Preflight</span>
              </div>
              <em className="status-purple">Indexing…</em>
              <small>1d ago</small>
            </div>
            <div className="project-row">
              <div className="project-icon project-icon-moss">D</div>
              <div>
                <b>Dev tools</b>
                <span>AbhiXO / dev-tools</span>
              </div>
              <em>Healthy</em>
              <small>3d ago</small>
            </div>
          </div>
          <div className="activity-card">
            <div className="dash-section-head">
              <span>Context pulse</span>
              <ScanLine size={14} />
            </div>
            <div className="pulse-ring">
              <strong>
                87<span>%</span>
              </strong>
              <small>indexed</small>
            </div>
            <div className="pulse-bar">
              <span />
            </div>
            <div className="activity-list">
              <span>
                <CircleDot size={12} /> 42 commits connected
              </span>
              <span>
                <GitPullRequest size={12} /> 13 PRs explained
              </span>
              <span>
                <MessageCircle size={12} /> 08 questions answered
              </span>
            </div>
          </div>
        </div>
        <div className="dash-question">
          <div className="response-mark">
            <RelayMark compact />
          </div>
          <span>Ask Relay about this project…</span>
          <ArrowRight size={15} />
        </div>
      </div>
    </div>
  );
}
