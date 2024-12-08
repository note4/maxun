import React, { useState, useContext } from 'react';
import axios from 'axios';
import styled from "styled-components";
import { stopRecording } from "../../api/recording";
import { useGlobalInfoStore } from "../../context/globalInfo";
import { IconButton, Menu, MenuItem, Typography, Avatar, Chip, Button, Modal, Tabs, Tab, Box } from "@mui/material";
import { AccountCircle, Logout, Clear, YouTube, X } from "@mui/icons-material";
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/auth';
import { SaveRecording } from '../molecules/SaveRecording';
import DiscordIcon from '../atoms/DiscordIcon';
import { apiUrl } from '../../apiConfig';
import MaxunLogo from "../../assets/maxunlogo.png";
import packageJson from "../../../package.json"

interface NavBarProps {
  recordingName: string;
  isRecording: boolean;
}

export const NavBar: React.FC<NavBarProps> = ({ recordingName, isRecording }) => {
  const { notify, browserId, setBrowserId, recordingUrl } = useGlobalInfoStore();
  const { state, dispatch } = useContext(AuthContext);
  const { user } = state;
  const navigate = useNavigate();

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const currentVersion = packageJson.version;

  const [open, setOpen] = useState(false);
  const [latestVersion, setLatestVersion] = useState(null);
  const [tab, setTab] = useState(0);

  const fetchLatestVersion = async () => {
    try {
      const response = await fetch("https://api.github.com/repos/getmaxun/maxun/releases/latest");
      const data = await response.json();
      const version = data.tag_name.replace(/^v/, ""); // Remove 'v' prefix
      setLatestVersion(version);
    } catch (error) {
      console.error("Failed to fetch latest version:", error);
      setLatestVersion(null); // Handle errors gracefully
    }
  };

  const handleUpdateOpen = () => {
    setOpen(true);
    fetchLatestVersion();
  };

  const handleUpdateClose = () => {
    setOpen(false);
    setTab(0); // Reset tab to the first tab
  };

  const handleUpdateTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTab(newValue);
  };


  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const logout = async () => {
    dispatch({ type: 'LOGOUT' });
    window.localStorage.removeItem('user');
    const { data } = await axios.get(`${apiUrl}/auth/logout`);
    notify('success', data.message);
    navigate('/login');
  };

  const goToMainMenu = async () => {
    if (browserId) {
      await stopRecording(browserId);
      notify('warning', 'Current Recording was terminated');
      setBrowserId(null);
    }
    navigate('/');
  };

  return (
    <NavBarWrapper>
      <div style={{
        display: 'flex',
        justifyContent: 'flex-start',
      }}>
        <img src={MaxunLogo} width={45} height={40} style={{ borderRadius: '5px', margin: '5px 0px 5px 15px' }} />
        <div style={{ padding: '11px' }}><ProjectName>Maxun</ProjectName></div>
        <Chip
          label={`v${currentVersion}`}
          color="primary"
          variant="outlined"
          sx={{ marginTop: '10px' }}
        />
      </div>
      {
        user ? (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
            {!isRecording ? (
              <>
                <Button variant="contained" onClick={handleUpdateOpen} sx={{marginRight: '30px'}}>
                  Check for Updates
                </Button>
                <Modal open={open} onClose={handleUpdateClose}>
                  <Box
                    sx={{
                      position: "absolute",
                      top: "50%",
                      left: "50%",
                      transform: "translate(-50%, -50%)",
                      width: 400,
                      bgcolor: "background.paper",
                      boxShadow: 24,
                      p: 4,
                      borderRadius: 2,
                    }}
                  >
                    {latestVersion === null ? (
                      <Typography>Checking for updates...</Typography>
                    ) : currentVersion === latestVersion ? (
                      <Typography variant="h6" textAlign="center">
                        🎉 You're up to date!
                      </Typography>
                    ) : (
                      <>
                        <Typography variant="h6" textAlign="center">
                          A new version is available: {latestVersion}
                        </Typography>
                        <Tabs
                          value={tab}
                          onChange={handleUpdateTabChange}
                          sx={{ marginTop: 2, marginBottom: 2 }}
                          centered
                        >
                          <Tab label="Manual" />
                          <Tab label="Docker Compose" />
                        </Tabs>
                        {tab === 0 && (
                          <Box>
                            <Typography variant="h6">Manual Upgrade</Typography>
                            <Typography component="pre" sx={{ bgcolor: "#f5f5f5", p: 2, borderRadius: 1 }}>
                              git pull origin main
                              <br />
                              npm install
                              <br />
                              npm run start
                            </Typography>
                          </Box>
                        )}
                        {tab === 1 && (
                          <Box>
                            <Typography variant="h6">Docker Compose Upgrade</Typography>
                            <Typography component="pre" sx={{ bgcolor: "#f5f5f5", p: 2, borderRadius: 1 }}>
                              docker pull getmaxun/maxun:latest
                              <br />
                              docker-compose up -d
                            </Typography>
                          </Box>
                        )}
                      </>
                    )}
                  </Box>
                </Modal>
                <iframe src="https://ghbtns.com/github-btn.html?user=getmaxun&repo=maxun&type=star&count=true&size=large" frameBorder="0" scrolling="0" width="170" height="30" title="GitHub"></iframe>
                <IconButton onClick={handleMenuOpen} sx={{
                  display: 'flex',
                  alignItems: 'center',
                  borderRadius: '5px',
                  padding: '8px',
                  marginRight: '10px',
                  '&:hover': { backgroundColor: 'white', color: '#ff00c3' }
                }}>
                  <AccountCircle sx={{ marginRight: '5px' }} />
                  <Typography variant="body1">{user.email}</Typography>
                </IconButton>
                <Menu
                  anchorEl={anchorEl}
                  open={Boolean(anchorEl)}
                  onClose={handleMenuClose}
                  anchorOrigin={{
                    vertical: 'bottom',
                    horizontal: 'right',
                  }}
                  transformOrigin={{
                    vertical: 'top',
                    horizontal: 'right',
                  }}
                  PaperProps={{ sx: { width: '180px' } }}
                >
                  <MenuItem onClick={() => { handleMenuClose(); logout(); }}>
                    <Logout sx={{ marginRight: '5px' }} /> Logout
                  </MenuItem>
                  <MenuItem onClick={() => {
                    window.open('https://discord.gg/5GbPjBUkws', '_blank');
                  }}>
                    <DiscordIcon sx={{ marginRight: '5px' }} /> Discord
                  </MenuItem>
                  <MenuItem onClick={() => {
                    window.open('https://www.youtube.com/@MaxunOSS/videos?ref=app', '_blank');
                  }}>
                    <YouTube sx={{ marginRight: '5px' }} /> YouTube
                  </MenuItem>
                  <MenuItem onClick={() => {
                    window.open('https://x.com/maxun_io?ref=app', '_blank');
                  }}>
                    <X sx={{ marginRight: '5px' }} /> Twiiter (X)
                  </MenuItem>
                </Menu>
              </>
            ) : (
              <>
                <IconButton onClick={goToMainMenu} sx={{
                  borderRadius: '5px',
                  padding: '8px',
                  background: 'red',
                  color: 'white',
                  marginRight: '10px',
                  '&:hover': { color: 'white', backgroundColor: 'red' }
                }}>
                  <Clear sx={{ marginRight: '5px' }} />
                  Discard
                </IconButton>
                <SaveRecording fileName={recordingName} />
              </>
            )}
          </div>
        ) : ""
      }
    </NavBarWrapper>
  );
};

const NavBarWrapper = styled.div`
  grid-area: navbar;
  background-color: white;
  padding:5px;
  display: flex;
  justify-content: space-between;
  border-bottom: 1px solid #e0e0e0;
`;

const ProjectName = styled.b`
  color: #3f4853;
  font-size: 1.3em;
`;
