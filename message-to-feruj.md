Hey, the runner is showing **Offline** in GitHub Actions and `https://backend.real-support.com/api/health` is also failing. Both happened together, which usually means it's the server, not the code — my last push only changed one TypeScript decorator file, nothing infra.

Please SSH into the backend VPS and run this — it will tell us exactly what's wrong in about 10 seconds:

```bash
echo '=== uptime ==='; uptime
echo '=== disk ==='; df -h /
echo '=== memory ==='; free -h
echo '=== oom killer ==='; sudo dmesg -T | grep -i 'killed process' | tail -5
echo '=== pm2 ==='; sudo -u feruj pm2 status
echo '=== port 8000 ==='; sudo ss -tlnp | grep ':8000' || echo 'nothing listening on 8000'
echo '=== local health ==='; curl -sS -o /dev/null -w '%{http_code}\n' http://localhost:8000/health
echo '=== runner service ==='; sudo systemctl status 'actions.runner.*' --no-pager | head -20
echo '=== nginx config ==='; sudo nginx -t 2>&1
```

Most likely one of these:

### 1. Disk is full
```bash
sudo truncate -s 0 /home/feruj/.pm2/logs/*.log
sudo journalctl --vacuum-time=2d
```

### 2. Out of memory during the build (OOM killer took both PM2 and the runner)
```bash
sudo -u feruj pm2 start /var/www/html/pssl-backend-nest/ecosystem.config.js --env production
sudo systemctl start 'actions.runner.*'
```

And add 2 GB swap so this stops happening:
```bash
sudo fallocate -l 2G /swapfile && sudo chmod 600 /swapfile
sudo mkswap /swapfile && sudo swapon /swapfile
echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab
```

### 3. VPS rebooted and services didn't auto-start
```bash
sudo systemctl enable --now 'actions.runner.*'
sudo -u feruj pm2 start /var/www/html/pssl-backend-nest/ecosystem.config.js --env production
sudo -u feruj pm2 save
sudo -u feruj pm2 startup systemd -u feruj --hp /home/feruj
```

Send me the output of the first block and I can pinpoint which one it is.
