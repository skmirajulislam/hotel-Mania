// PM2 ecosystem configuration for production deployment
module.exports = {
    apps: [
        {
            name: 'grand-hotel-api',
            script: './server.js',
            cwd: './backend',
            instances: 'max', // Use all CPU cores
            exec_mode: 'cluster',
            env: {
                NODE_ENV: 'development',
                PORT: 5002
            },
            env_production: {
                NODE_ENV: 'production',
                PORT: process.env.PORT || 5002
            },
            // Performance monitoring
            monitoring: true,
            pmx: true,

            // Restart configuration
            max_restarts: 10,
            min_uptime: '10s',
            max_memory_restart: '1G',

            // Logging
            log_file: './logs/combined.log',
            out_file: './logs/out.log',
            error_file: './logs/error.log',
            log_date_format: 'YYYY-MM-DD HH:mm:ss Z',

            // Advanced options
            kill_timeout: 5000,
            listen_timeout: 8000,
            restart_delay: 4000,

            // Health monitoring
            health_check_grace_period: 3000,

            // Environment-specific settings
            node_args: process.env.NODE_ENV === 'production' ? '--max-old-space-size=1024' : '',

            // Source map support for better error tracking
            source_map_support: true,

            // Merge logs from all instances
            merge_logs: true,

            // Auto restart on file changes (development only)
            watch: process.env.NODE_ENV !== 'production',
            watch_delay: 1000,
            ignore_watch: [
                'node_modules',
                'logs',
                '*.log',
                '.git'
            ],

            // Graceful shutdown
            shutdown_with_message: true,
            wait_ready: true,

            // Cron restart (restart every day at 3 AM in production)
            cron_restart: process.env.NODE_ENV === 'production' ? '0 3 * * *' : undefined,

            // Custom environment variables
            env_vars: {
                COMMON_VARIABLE: 'true'
            },

            // Instance variables (if needed)
            instance_var: 'INSTANCE_ID'
        }
    ],

    // Deployment configuration
    deploy: {
        production: {
            user: 'deploy',
            host: ['your-server.com'],
            ref: 'origin/master',
            repo: 'https://github.com/yourusername/hotel-grand-hotel.git',
            path: '/var/www/grand-hotel',
            'pre-deploy-local': '',
            'post-deploy': 'cd backend && npm install && pm2 reload ecosystem.config.js --env production',
            'pre-setup': '',
            'ssh_options': 'StrictHostKeyChecking=no'
        },
        staging: {
            user: 'deploy',
            host: ['staging-server.com'],
            ref: 'origin/develop',
            repo: 'https://github.com/yourusername/hotel-grand-hotel.git',
            path: '/var/www/grand-hotel-staging',
            'post-deploy': 'cd backend && npm install && pm2 reload ecosystem.config.js --env staging',
            env: {
                NODE_ENV: 'staging',
                PORT: 5002
            }
        }
    }
};
