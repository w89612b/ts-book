var gulp = require('gulp'),
    tslint = require('gulp-tslint'),
    ts = require('gulp-typescript'),
    browserify = require('browserify'),
    transform = require('vinyl-transform'),
    source = require('vinyl-source-stream'),
    buffer = require('vinyl-buffer'),
    rename = require('gulp-rename'),
    uglify = require('gulp-uglify'),
    sourcemaps = require('gulp-sourcemaps'),
    karma = require('gulp-karma'),
    runSequence = require('run-sequence'),
    browserSync = require('browser-sync'),
    flatten = require('gulp-flatten');
//******************************************************************************
//* LINT
//******************************************************************************
/*检测TypeScript 代码质量任务*/
gulp.task('lint', function() {
    return gulp.src([
            __dirname + '/src/**/**.ts',
            __dirname + '/test/**/**.test.ts'
        ])
        .pipe(tslint({
            formatter: "verbose"
        }))
        .pipe(tslint.report());
});
//******************************************************************************
//* BUILD
//******************************************************************************
/*typescript 编译项目配置*/
var tsProject = ts.createProject({
    removeComments: false,
    noImplicitAny: false,
    target: 'ES3',
    module: 'commonjs',
    declarationFiles: false,
    experimentalDecorators: true
});
/*编译TypeScript 项目代码任务*/
gulp.task('build-source', function() {
    return gulp.src(['./src/ts/**/**.ts'])
        .pipe(ts(tsProject))
        .js.pipe(gulp.dest('./temp/js/'));
});
/*编译TypeScript 测试代码任务*/
gulp.task('tsc-test', function() {
    return gulp.src(['./test/**/**.test.ts'])
        .pipe(ts(tsProject))
        .js.pipe(gulp.dest('./temp/test/'));
});
/*编译源代码*/
gulp.task("build", function(cb) {
    runSequence("lint", "build-source", "build-test", cb);
});
//******************************************************************************
//* BUNDLE
//******************************************************************************
/*browserified 函数会把一个普通的Node.js流转换为一个gulp流*/
var browserified = transform(function(filename) {
    var b = browserify({ entries: filename, debug: true });
    return b.bundle();
});

/*合并文件 压缩代码 生成源代码Map 输出生产环境文件   任务*/
gulp.task('bundle-js', function() {
    var b = browserify({ entries: './temp/js/framework.js', debug: true });

    return b.bundle()
        //.pipe(sourcemaps.init()) // 开启map收集
        .pipe(source('bundle.js'))
        .pipe(buffer())
        //.pipe(sourcemaps.write()) // 输出map文件
        .pipe(gulp.dest('./dist/js/')) // 输出生产文件
        .pipe(rename({ suffix: '.min' })) // 重命名
        .pipe(uglify()) // 压缩代码
        .pipe(gulp.dest('./dist/js/')) // 输出生产文件
});

/*测试文件输出任务*/
gulp.task('bundle-test', function() {
    return gulp.src('./temp/test/**/**.test.js')
        .pipe(browserified)
        .pipe(gulp.dest('./dist/test/'))
});
//******************************************************************************
//* 单元测试任务
//******************************************************************************
gulp.task('karma', function(cb) {
    gulp.src('./dist/js/**/**.test.js')
        .pipe(karma({
            configFile: 'karma.conf.js',
            action: 'run'
        }))
        .on('end', cb)
        .on('error', function(err) {
            // 确保测试失败后让gulp以非0的状态退出
            return true;
        })
});

/*合并任务*/
gulp.task('bundle', function(cb) {
    runSequence('build', ['bundle-js', 'bundle-test'], cb);
});

/*合并任务*/
gulp.task('test', function(cb) {
    runSequence('bundle', ['karma'], cb);
})

//******************************************************************************
//* 复制文件
//******************************************************************************
gulp.task('copy', function() {
    gulp.src([
            'node_modules/jquery/dist/{jquery,jquery.min}.js',
            'node_modules/bootstrap/dist/**',
            'node_modules/q/q.js',
            'node_modules/animate.css/{animate,animate.min}.css',
            'node_modules/handlebars/dist/handlebars.min.js',
            'node_modules/highcharts/scripts/highcharts.js'
        ])
        .pipe(flatten({ includeParents: [1, 1] })) // 移动指定文件，并且去掉源路径
        .pipe(gulp.dest('./dist/lib'));
});


//******************************************************************************
//* 跨设备测试同步
//******************************************************************************
/*跨设备测试同步实现*/
gulp.task('browser-sync', ['test'], function() {
    browserSync({
        server: {
            baseDir: './dist',
        }
    });
    return gulp.watch([
        "./dist/js/**/*.js",
        "./dist/css/**.css",
        "./dist/test/**/**.test.js",
        "./dist/data/**/**",
        "./index.html"
    ], [browserSync.reload])
});



/*控制任务执行顺序*/
gulp.task('default', function(cb) {
    runSequence(
        'lint', // lint
        ["build-source", "build-test"], // compile
        ['bundle-js', 'bundle-test'], // optimize
        'karma', // test
        'browser-sync', //server
        cb // callback
    )
    console.log('hello gulp!');
});