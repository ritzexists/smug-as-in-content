import { useEffect } from 'react';
import { useMediaStore } from '../store';
import { syncToS3 } from '../services/s3Sync';
import { syncToSSH } from '../services/sshSync';

export function SyncManager() {
  const { items, activeSyncs, getPluginSecret } = useMediaStore();

  // S3 Sync Logic
  useEffect(() => {
    if (activeSyncs.includes('s3')) {
      const endpoint = getPluginSecret('s3', 'endpoint');
      const region = getPluginSecret('s3', 'region');
      const bucket = getPluginSecret('s3', 'bucket');
      const accessKeyId = getPluginSecret('s3', 'accessKeyId');
      const secretAccessKey = getPluginSecret('s3', 'secretAccessKey');

      if (endpoint && bucket && accessKeyId && secretAccessKey) {
        // Debounce sync to avoid too many requests
        const timer = setTimeout(() => {
          syncToS3(items, {
            endpoint,
            region: region || 'us-east-1',
            bucket,
            accessKeyId,
            secretAccessKey,
          }).catch(err => console.error('S3 Sync failed:', err));
        }, 2000);

        return () => clearTimeout(timer);
      }
    }
  }, [items, activeSyncs, getPluginSecret]);

  // SSH/SFTP Sync Logic
  useEffect(() => {
    const syncTypes = ['sftp', 'sshfs'];
    syncTypes.forEach(syncId => {
      if (activeSyncs.includes(syncId)) {
        const host = getPluginSecret(syncId, 'host');
        const port = getPluginSecret(syncId, 'port');
        const username = getPluginSecret(syncId, 'username');
        const password = getPluginSecret(syncId, 'password');
        const privateKey = getPluginSecret(syncId, 'privateKey');
        const path = getPluginSecret(syncId, 'path');

        if (host && username && path) {
          const timer = setTimeout(() => {
            syncToSSH(items, {
              host,
              port: port ? parseInt(port) : 22,
              username,
              password,
              privateKey,
              path,
              type: syncId as 'sftp' | 'sshfs'
            }).catch(err => console.error(`${syncId.toUpperCase()} Sync failed:`, err));
          }, 2000);

          return () => clearTimeout(timer);
        }
      }
    });
  }, [items, activeSyncs, getPluginSecret]);

  return null;
}
