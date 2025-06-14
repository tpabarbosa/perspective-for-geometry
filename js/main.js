class JSLoader {
    static async loadScript(src) {
        return new Promise((resolve, reject) => {
            const script = document.createElement('script');
            script.src = src;
            script.onload = resolve;
            script.onerror = reject;
            document.head.appendChild(script);
        });
    }

    static async loadScripts(scripts) {
        for (const script of scripts) {
            await this.loadScript(script);
        }
    }
}

// Load all required scripts in order
async function initializeApp() {
    try {
        const scripts = [
            'js/AppState.js',
            'js/Point.js',
            'js/Grid.js',
            'js/Canvas.js',
            'js/Controls.js',
            'js/HorizonLine.js',
            'js/PerspectiveCamera.js',
            'js/Triangle.js',
            'js/Tetrahedron.js',
            'js/GeometryApp.js'
        ];

        await JSLoader.loadScripts(scripts);

        // Initialize the application after all scripts are loaded
        window.geometryApp = new GeometryApp();

    } catch (error) {
        console.error('Failed to load scripts:', error);
    }
}

// Start loading when DOM is ready
document.addEventListener('DOMContentLoaded', initializeApp);

