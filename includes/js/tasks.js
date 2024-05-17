const BootstrapVersion = 5,
      FontAwesomeVersion = 6;

$(() =>{

    const TaskManager = {
        tasks      : [],
        path       : null,
        ui         : {},
        isBoxLang  : false,
        dateFormat : `'<span class="text-nowrap">'D'</span> <small class="text-nowrap text-muted">'tt'</small>'`,
        timeFormat : `'<small class="d-block text-nowrap text-muted">@ 'tt'</small>'`,
        stringFormat : new Intl.PluralRules('en', {type: 'ordinal'}),
        suffixes     : new Map([
            ['one', 'st'],
            ['two', 'nd'],
            ['few', 'rd'],
            ['other', 'th'],
        ]),
        days     : new Map([
            [1, 'Monday'],
            [2, 'Tuesday'],
            [3, 'Wednesday'],
            [4, 'Thursday'],
            [5, 'Friday'],
            [6, 'Saturday'],
            [7, 'Sunday'],
        ]),

        init : function(){
            if ( typeof entryPoint === 'undefined' ){
                console.error( 'entryPoint const is required to init TaskManager' );
                return;
            }

            if ( typeof tasks === 'undefined' ){
                console.error( 'tasks const is required to init TaskManager' );
                return;
            }

            const self = this;

            self.tasks     = tasks;
            self.path      = entryPoint;
            self.isBoxLang = entryPoint.indexOf('?event=') !== -1;

            self.ui = {
                table : $( '#dt-tasks' ),
                toast : $( '#toast-container' )
            };

            self.render();
            self.setUpListerners();
        },

        buildPath : function( path ){
            const self = this;
            return self.path + ( self.isBoxLang ? `main.${path}` : path );
        },

        render : function(){
            const self = this;

            if ( !self.ui.data_table ){
                self.ui.data_table = self.ui.table.DataTable({
                    data : self.tasks,
                    lengthMenu: [
                        [ 10, 25, 50, 100, -1 ],
                        [ 10, 25, 50, 100, 'All' ],
                    ],
                    stateSave   : true,
                    order       : [[0, 'asc']],
                    responsive  : { details:true },
                    fixedHeader : {
                        header       : true,
                        headerOffset : $('.sticky-top').outerHeight()
                    },
                    language  : {
                        info         : 'Showing _START_ to _END_ of _TOTAL_ tasks',
                        infoEmpty    : 'Showing 0 to 0 of 0 tasks',
                        infoFiltered : '(filtered from _MAX_ total tasks)',
                        emptyTable   : 'Your application does not have any scheduled tasks',
                        zeroRecords  : 'No tasks matched your filter',
                        lengthMenu   : 'Show _MENU_ Tasks',
                        search       : '<span class="input-group-text"><i class="fa-solid fa-search"></i></span>',
                        paginate     : {
                            first    : '<i class="fa-solid fa-angles-left"></i>',
                            previous : '<i class="fa-solid fa-angle-left"></i>',
                            next     : '<i class="fa-solid fa-angle-right"></i>',
                            last     : '<i class="fa-solid fa-angles-right"></i>',
                        },
                    },
                    columns : [
                        {
                            data               : 'module',
                            title              : 'Module / Executor',
                            responsivePriority : 1,
                            className          : 'text-nowrap',
                            render             : ( data, type, row ) => {
                                return `${data}<small class="d-block text-muted">${row.executor}</small>`;
                            }
                        },
                        {
                            data               : 'group',
                            title              : 'Group',
                            orderData          : [1, 2],
                            responsivePriority : 4,
                        },
                        {
                            data               : 'label',
                            title              : 'Task',
                            responsivePriority : 2,
                        },
                        {
                            data       : 'startOn',
                            title      : 'Start On',
                            searchable : false,
                            render     : function ( data, type, row ) {
                                return type === 'sort' ?
                                        luxon.DateTime.fromISO(data).toSeconds() :
                                        luxon.DateTime.fromISO(data).toFormat( self.dateFormat );
                            }
                        },
                        {
                            data       : 'lastRun',
                            title      : 'Last Run',
                            searchable : false,
                            render     : function ( data, type, row ) {
                                return type === 'sort' ?
                                        ( data === '' ? 0 : luxon.DateTime.fromISO(data).toSeconds() ) :
                                        ( data === '' ? '-' : luxon.DateTime.fromISO(data).toFormat( self.dateFormat ) );
                            }
                        },
                        {
                            data       : 'nextRun',
                            title      : 'Next Run',
                            searchable : false,
                            render     : function ( data, type, row ) {
                                return type === 'sort' ?
                                        ( data === '' ? 0 : luxon.DateTime.fromISO(data).toSeconds() ) :
                                        ( data === '' ? '-' : luxon.DateTime.fromISO(data).toFormat( self.dateFormat ) );
                            }
                        },
                        {
                            data       : null,
                            className  : 'text-nowrap',
                            title      : 'Period / Time Unit',
                            searchable : false,
                            sortable   : false,
                            render     : function ( data, type, row ) {
                                return (
                                            row.annually ?
                                            `Annually` :
                                            row.weekdays ?
                                            `Every Weekday ${ luxon.DateTime.fromISO(row.nextRun).toFormat( self.timeFormat )}` :
                                            row.weekends ?
                                            `Every Weekend ${ luxon.DateTime.fromISO(row.nextRun).toFormat( self.timeFormat )}` :
                                            row.firstBusinessDay ?
                                            `First Business Day of the Month ${ luxon.DateTime.fromISO(row.nextRun).toFormat( self.timeFormat )}` :
                                            row.lastBusinessDay ?
                                            `Last Business Day of the Month ${ luxon.DateTime.fromISO(row.nextRun).toFormat( self.timeFormat )}` :
                                            row.dayOfTheMonth ?
                                            `Monthly on the ${row.dayOfTheMonth + self.suffixes.get( self.stringFormat.select( row.dayOfTheMonth ) )} ${ luxon.DateTime.fromISO(row.nextRun).toFormat( self.timeFormat )}` :
                                            row.dayOfTheWeek ?
                                            `Every ${self.days.get( row.dayOfTheWeek )} ${ luxon.DateTime.fromISO(row.nextRun).toFormat( self.timeFormat )}` :
                                            row.period + ' / ' + row.timeUnit
                                        ) +
                                        ( row.startTime && row.endTime ?
                                            `<small class="d-block text-nowrap text-danger">
                                                Between
                                                ${luxon.DateTime.fromString(row.startTime,'HH:mm').toFormat('h:mm a')} -
                                                ${luxon.DateTime.fromString(row.endTime,'HH:mm').toFormat('h:mm a')}
                                            </small>` :
                                            row.startTime ?
                                            `<small class="d-block text-nowrap text-danger">
                                                From ${luxon.DateTime.fromString(row.startTime,'HH:mm').toFormat('h:mm a')}
                                            </small>`:
                                            row.endTime ?
                                            `<small class="d-block text-nowrap text-danger">
                                                Until ${luxon.DateTime.fromString(row.endTime,'HH:mm').toFormat('h:mm a')}
                                            </small>` :
                                            ''
                                        );
                            }
                        },
                        {
                            data       : 'lastExecutionTime',
                            title      : 'Last Exec Time',
                            className  : 'text-center text-nowrap',
                        },
                        {
                            data               : 'totalRuns',
                            title              : 'Runs',
                            className          : 'text-center',
                            responsivePriority : 3,
                        },
                        {
                            data               : 'canRun',
                            title              : 'Status',
                            searchable         : false,
                            sortable           : false,
                            className          : 'text-end text-nowrap',
                            responsivePriority : 1,
                            render             : function ( data, type, row ) {
                                return (
                                            row.debugEnabled ?
                                            '<i class="fa-solid fa-bug fa-sm text-danger-emphasis me-2"></i>' :
                                            ''
                                        ) +
                                        (
                                            !row.canRun ?
                                            '<i class="fa-solid fa-xmark fa-xl text-muted"></i>' :
                                            `<i class="fa-solid fa-person-running me-2 text-success" data-action="run" data-task="${row.name}" data-module="${row.module}" data-id="${row.id}"></i>`
                                             +
                                            (
                                                row.disabled ?
                                                `<i class="fa-solid fa-toggle-off fa-xl text-secondary" data-action="update" data-status="off" data-task="${row.name}" data-module="${row.module}" data-id="${row.id}"></i>` :
                                                `<i class="fa-solid fa-toggle-on fa-xl text-success" data-action="update" data-status="on" data-task="${row.name}" data-module="${row.module}" data-id="${row.id}"></i>`
                                            ) +
                                            `<i class="fa-solid fa-trash ms-2 text-danger" data-action="delete" data-task="${row.name}" data-module="${row.module}" data-id="${row.id}"></i>`
                                        );
                            }
                        }
                    ],
                    initComplete : function( settings, json ) {
                        const   wrapper    = self.ui.table.closest('.dt-container'),
                                pageLength = wrapper.find('.dt-length'),
                                filter     = wrapper.find('.dt-search'),
                                labels     = pageLength.find('label').text().split(' ');

                        // update table header
                        self.ui.table
                            .find('thead')
                            .addClass('table-dark');

                        // prepare search bar
                        wrapper
                            .find('.row:first-child, .row:last-child')
                            .attr('class','d-flex flex-column-reverse flex-sm-row gap-2 justify-content-between align-items-center my-2')
                            .find('> div')
                            .attr('class','')
                            .end()
                            .filter('.d-flex:first-child')
                            .removeClass('flex-column-reverse')
                            .addClass('flex-column p-3 bg-body-secondary border my-2');
                         // update the page length select
                         pageLength
                            .addClass('input-group input-group-sm flex-nowrap')
                            .find('select')
                            .appendTo( pageLength )
                            .parent()
                            .prepend(`<span class="input-group-text">${labels[0]}</span>`)
                            .append(`<span class="input-group-text">${labels[labels.length-1]}</span>`)
                            .find('label').remove();
                          // update the search
                          filter
                            .addClass('input-group input-group-sm flex-nowrap')
                            .find('span, input')
                            .prependTo( filter )
                            .find('label').remove();
                    }
                });
            }
        },

        setUpListerners : function(){
            const self = this;

            self.ui.table
                .on( 'click','[data-action]', function(){
                    const data = this.dataset;

                    if ( data.action && data.action !== 'delete' ){
                        $.post( self.buildPath(`task${data.action}`),data )
                            .done( response => {
                                switch ( data.action ){
                                    case 'update':
                                        self.tasks.find( e => e.id === data.id ).disabled = response.disabled;
                                        self.update( self.tasks );
                                        self.toast( !response.disabled, `Task ${data.module}.${data.task} has been ${ response.disabled ? 'disabled' : 'enabled'}` );
                                        break;
                                    case 'run':
                                        self.tasks.find( e => e.id === data.id ).totalRuns = response.stats.totalRuns;
                                        self.update( self.tasks );
                                        self.toast( true, `Task ${data.module}.${data.task} has been executed` );
                                        break;
                                }
                            });
                    }
                    else if ( data.action === 'delete' ) {
                        openActionDialog({
                            header                  : 'Delete Task',
                            cancelButtonLast        : true,
                            cancelButtonColorClass  : 'btn-secondary',
                            confirmButtonColorClass : 'btn-success',
                            dostatic                : true,
                            noerror                 : true,
                            dialogclass             : 'modal-dialog-centered text-center',
                            message                 : `Are you sure you want to delete the task <b>${data.module}.${data.task}</b>?`,
                            callback                : mdl => {
                                 $.post( self.buildPath('taskdelete'),data )
                                    .done( response => {
                                        self.toast( true, `Task ${data.module}.${data.task} has been deleted` );
                                        self.update( response.tasks );
                                        mdl.modal( 'hide' );
                                    });
                            }
                        });
                    }
                })
        },

        toast : function( success, message ){
            const self = this;

             // show toast
             self.ui.toast.append(`
                <div class="toast align-items-center text-bg-${success ? 'success' : 'danger'} border-0 mb-1" style="--bs-bg-opacity: .9;" role="alert" aria-live="assertive" aria-atomic="true">
                    <div class="d-flex">
                        <div class="toast-body">
                            ${message}
                        </div>
                        <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast" aria-label="Close"></button>
                    </div>
                </div>
            `).find('.toast:last-child').toast('show');
        },

        update : function ( tasks ) {
            const self = this;

            self.tasks = tasks;
            self.ui.data_table.clear();
            self.ui.data_table.rows.add( self.tasks );
            self.ui.data_table.draw( false );
        }
    };

    TaskManager.init();
});