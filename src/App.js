import React, { useState, useEffect } from 'react';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Highlight from 'react-highlight';


   
function size(x) {
  let l = 0, n = parseInt(x, 10) || 0;
  while (n >= 1024 && ++l) {
    n = n/1024;
  }
  return (n.toFixed(n < 10 && l > 0 ? 1 : 0) + ' ' + ['b', 'kb', 'mb', 'gb', 'tb', 'pb', 'eb', 'zb', 'yb'][l]);
}



function App() {
  const [packages, setPackages] = useState([]);
  useEffect(() => {
    fetch('https://deb.manta.systems/packages.json')
      .then(response => response.json())
      .then((packages) => setPackages(packages.map((p) => ({
        ...p,
        name: p.key.split('/').reverse()[0].split('_')[0],
        version: p.key.split('/').reverse()[0].split('_')[1],
        arch: p.key.split('/').reverse()[0].split('_')[2].replace('.deb', ''),
      }))))
      .catch(console.error);
  }, []);
  return (
    <Container>
      <Row>
        <h1>manta apt repository</h1>
        <h3>apt (.deb) packages built on and for ubuntu focal (20.04) amd64/x86_64</h3>
        <p className="text-muted">
          see: <a href="https://rpm.manta.systems/">rpm.manta.systems</a> for fedora (.rpm) packages.
        </p>
      </Row>
      <Row style={{padding: '1em'}}>
        <h4>add this repository to your apt sources</h4>
        <p>
          store and trust the <a href="https://keys.mailvelope.com/pks/lookup?op=get&search=security@manta.network">manta security public key</a>:
        </p>
        <Highlight className="language-bash">
          {
            [
              `#!/bin/bash`,
              `sudo curl -o /usr/share/keyrings/manta.gpg https://deb.manta.systems/manta.gpg`
            ].join('\n')
          }
        </Highlight>
        <p>
          optionally, verify that your copy of the manta security public key has the correct sha 256 checksum (<code>da27ca1f09186434a1ec283368b0274fe03736b2b6927c462bc3c1017139fc53</code>):
        </p>
        <Highlight className="language-bash">
          {
            [
              `#!/bin/bash`,
              `if ! echo "da27ca1f09186434a1ec283368b0274fe03736b2b6927c462bc3c1017139fc53 /usr/share/keyrings/manta.gpg" | sha256sum --check; then`,
              `  if sudo rm /usr/share/keyrings/manta.gpg; then`,
              `    echo "/usr/share/keyrings/manta.gpg had an invalid checksum, cannot be trusted and has been removed"`,
              `  fi`,
              `fi`
            ].join('\n')
          }
        </Highlight>
        <p>
          fetch and store the manta apt repository sources list:
        </p>
        <Highlight className="language-bash">
          {
            [
              `#!/bin/bash`,
              `sudo curl -o /etc/apt/sources.list.d/manta.list https://deb.manta.systems/manta.list`,
              `sudo apt update`
            ].join('\n')
          }
        </Highlight>
        <h4>install, update or remove the manta node binary and the manta and calamari systemd services</h4>
        <p>
          manta .deb packages include:
        </p>
        <ul style={{paddingLeft: '2em'}}>
          <li>
            binary/executable
            <ul>
              <li>
                <code>/usr/bin/manta</code>
                <span className="text-muted">: the manta binary</span>
              </li>
              <li>
                <code>/usr/bin/calamari</code>
                <span className="text-muted">: a symlink to the manta binary</span>
              </li>
            </ul>
          </li>
          <li>
            service/daemon configurations
            <ul>
              <li>
                <code>/usr/lib/systemd/system/manta.service</code>
                <span className="text-muted">: manta systemd unit file</span>
              </li>
              <li>
                <code>/usr/lib/systemd/system/calamari.service</code>
                <span className="text-muted">: calamari systemd unit file</span>
              </li>
            </ul>
          </li>
          <li>
            blockchain specifications
            <ul>
              <li>
                <code>/usr/share/substrate/calamari.json</code>
                <span className="text-muted">
                  : calamari parachain chainspec
                  (source: <a href="https://github.com/Manta-Network/Manta/blob/manta/genesis/calamari-genesis.json">github/Manta-Network/Manta/calamari</a>)
                </span>
              </li>
              <li>
                <code>/usr/share/substrate/kusama.json</code>
                <span className="text-muted">
                  : kusama relay chainspec
                  (source: <a href="https://github.com/paritytech/polkadot/blob/master/node/service/res/kusama.json">github/paritytech/polkadot/kusama</a>)
                </span>
              </li>
              <li>
                <code>/usr/share/substrate/manta.json</code>
                <span className="text-muted">
                  : manta parachain chainspec
                  (source: <a href="https://github.com/Manta-Network/Manta/blob/manta/genesis/manta-genesis.json">github/Manta-Network/Manta/manta</a>)
                </span>
              </li>
              <li>
                <code>/usr/share/substrate/polkadot.json</code>
                <span className="text-muted">
                  : polkadot relay chainspec
                  (source: <a href="https://github.com/paritytech/polkadot/blob/master/node/service/res/polkadot.json">github/paritytech/polkadot/polkadot</a>)
                </span>
              </li>
            </ul>
          </li>
        </ul>
        <p>
          when a manta .deb package is installed, the preinstall script will create a system user with username: <code>manta</code>.
          <br />
          the home directory of the <code>manta</code> system user: <code>/var/lib/substrate</code>, is created simultaneously. this <em>"home"</em> directory is also referred to in subtstrate terminology as the <strong><em>basepath</em></strong>.
          <br />
          when the manta binary/executable is run, it will begin to sync both the relay-chain and parachain blockchains to the <code>/var/lib/substrate</code> basepath.
          the basepath will grow in size to accomodate these blockchains and will require in excess of 60 gb of disk space. it is sensible to budget up to 240 gb of disk space per relay-chain/parachain pair.
          it is normal that it will take between one and two weeks to completely synchronise a relay chain and parachain.
        </p>
        <p>
          install latest manta package:
        </p>
        <Highlight className="language-bash">
          {
            [
              `#!/bin/bash`,
              `sudo apt update`,
              `sudo apt install manta`
            ].join('\n')
          }
        </Highlight>
        <p>
          install a specific version of manta which is not the latest version:
        </p>
        <Highlight className="language-bash">
          {
            [
              `#!/bin/bash`,
              `version=3.1.1`,
              'curl -sLO https://deb.manta.systems/pool/main/m/manta/manta_${version}_amd64.deb',
              'sudo dpkg -i manta_${version}_amd64.deb',
              'rm manta_${version}_amd64.deb'
            ].join('\n')
          }
        </Highlight>
        <p>
          upgrade to the latest manta package:
        </p>
        <Highlight className="language-bash">
          {
            [
              `#!/bin/bash`,
              `sudo apt update`,
              `sudo apt install --only-upgrade manta`
            ].join('\n')
          }
        </Highlight>
        <p>
          uninstall manta, leaving services configuration and blockchain basepath (<code>/var/lib/substrate</code>) intact:
        </p>
        <Highlight className="language-bash">
          {
            [
              `#!/bin/bash`,
              `sudo apt remove manta`
            ].join('\n')
          }
        </Highlight>
        <p>
          remove all files created by a manta install, remove the manta user and group and all files owned by the manta user including the blockchain basepath (<code>/var/lib/substrate</code>):
        </p>
        <Highlight className="language-bash">
          {
            [
              `#!/bin/bash`,
              `sudo apt purge manta`
            ].join('\n')
          }
        </Highlight>
        <h4>check, enable and start manta/calamari service(s)</h4>
        <p>
          check the status of the calamari service:
        </p>
        <Highlight className="language-bash">
          {
            [
              `#!/bin/bash`,
              `systemctl status calamari.service`
            ].join('\n')
          }
        </Highlight>
        <p>
          enable calamari service (the service will start automatically on system boot):
        </p>
        <Highlight className="language-bash">
          {
            [
              `#!/bin/bash`,
              `sudo systemctl enable calamari.service`
            ].join('\n')
          }
        </Highlight>
        <p>
          enable and start calamari service immediately:
        </p>
        <Highlight className="language-bash">
          {
            [
              `#!/bin/bash`,
              `sudo systemctl enable --now calamari.service`
            ].join('\n')
          }
        </Highlight>
        <p>
          start calamari service:
        </p>
        <Highlight className="language-bash">
          {
            [
              `#!/bin/bash`,
              `sudo systemctl start calamari.service`
            ].join('\n')
          }
        </Highlight>
        <p>
          stop calamari service:
        </p>
        <Highlight className="language-bash">
          {
            [
              `#!/bin/bash`,
              `sudo systemctl stop calamari.service`
            ].join('\n')
          }
        </Highlight>
        <p>
          debug calamari service configuration (run calamari as the manta user, to quickly check for runtime errors):
        </p>
        <Highlight className="language-bash">
          {
            [
              `#!/bin/bash`,
              `sudo -H -u manta bash -c '/usr/bin/calamari --chain /usr/share/substrate/calamari.json --base-path /var/lib/substrate --port 31333 --ws-port 9144 --ws-max-connections 100 --rpc-port 9133 --rpc-cors all --rpc-methods safe --state-cache-size 0 --bootnodes /dns/crispy.calamari.systems/tcp/30333/p2p/12D3KooWNE4LBfkYB2B7D4r9vL54YMMGsfAsXdkhWfBw8VHJSEQc /dns/crunchy.calamari.systems/tcp/30333/p2p/12D3KooWL3ELxcoMGA6han3wPQoym5DKbYHqkWkCuqyjaCXpyJTt /dns/hotdog.calamari.systems/tcp/30333/p2p/12D3KooWBdto53HnArmLdtf2RXzNWti7hD5mML7DWGZPD8q4cywv /dns/tasty.calamari.systems/tcp/30333/p2p/12D3KooWGs2hfnRQ3Y2eAoUyWKUL3g7Jmcsf8FpyhVYeNpXeBMSu /dns/tender.calamari.systems/tcp/30333/p2p/12D3KooWNXZeUSEKRPsp1yiDH99qSVawQSWHqG4umPjgHsn1joci -- --chain /usr/share/substrate/kusama.json'`
            ].join('\n')
          }
        </Highlight>
      </Row>
      <Row style={{padding: '1em'}}>
        <h4>
          packages available from this repository
        </h4>
        <ul>
          {
            [...new Set(packages.map((p) => p.name))].map((name) => (
              <li key={name}>
                <strong>{name}</strong>
                <ul>
                  {
                    [...new Set(packages.filter(p => p.name === name).map(p => p.arch))].map((arch) => (
                      <li key={arch}>
                        {arch}
                        <ul>
                          {
                            packages.filter(p => p.name === name && p.arch === arch).sort((a, b) => ((a.version > b.version) ? 1 : (a.version < b.version) ? -1 : 0)).reverse().map((p) => (
                              <li key={p.version}>
                                <a href={`https://deb.manta.systems/${p.key}`}>
                                  {p.version}
                                </a>
                                <span style={{marginLeft: '0.5em'}} className="text-muted">
                                  ({p.key.split('/').reverse()[0]})
                                </span>
                                <br />
                                <span>
                                  {size(p.size)}
                                </span>
                                <span style={{marginLeft: '0.5em'}} className="text-muted">
                                  last modified: {new Intl.DateTimeFormat('en-GB').format(new Date(p.modified))}
                                </span>
                              </li>
                            ))
                          }
                        </ul>
                      </li>
                    ))
                  }
                </ul>
              </li>
            ))
          }
        </ul>
      </Row>
    </Container>
  );
}

export default App;
