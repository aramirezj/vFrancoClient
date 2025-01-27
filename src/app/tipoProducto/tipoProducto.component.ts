import { Component, OnInit, ViewChild } from '@angular/core';
import { TipoProducto } from '../interfaces/TipoProducto';
import { TipoProductoService } from '../services/TipoProducto.service';
import { MatDialog } from '@angular/material/dialog';
import { GTForm, GTFormService, GTPeticionExpansion, GTPeticionPaginacion, GTTableComponent, GT_TF } from 'ngx-generic-tools';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { FormControl, FormGroup } from '@angular/forms';
import { Sort } from '@angular/material/sort';
import { GF_Form, GF_APIRequest,  GFFormService, GF_TypeControl, GF_TypeForm } from '@aramirezj/ngx-generic-form';

/**
 * 
 */
@Component({
  selector: 'app-tipoProducto',
  templateUrl: './tipoProducto.component.html',
  styleUrls: ['./tipoProducto.component.scss']
})
export class TipoProductoComponent implements OnInit {
  listadoTipoProducto: TipoProducto[]
  columnasTipo: string[] = ["ID", "Nombre"]
  modeloTipo: string[]  = ["id", "nombre"]
  paginationAsync: GTPeticionPaginacion = new GTPeticionPaginacion(this.tipoProductoService.getTipoProductoPlist)
  totalTipoProductos: number = 0
  FormSearch: FormGroup; 
  lastpage: PageEvent;
  lastsearch: string;
  //Para que el formulario al aceptar ejecute el solo la función del servicio
  peticionUpdate: GF_APIRequest = new GF_APIRequest(this.tipoProductoService.edit.bind(this.tipoProductoService), ['OBJECT'])
  peticionCreate: GF_APIRequest = new GF_APIRequest(this.tipoProductoService.create.bind(this.tipoProductoService), ['OBJECT'])
  /**
   * Es un formulario que muestra los campos de tipo producto y dependiendo de su tipo permitira hacer el crud
   */
  formTipo: GF_Form<TipoProducto> = new GF_Form(GF_TypeForm.CREATION, this.modeloTipo, this.columnasTipo, "Creación")
  /**
   * Para tener acceso a los metodos de la tabla (se usa para el refrescar tabla)
   */
  @ViewChild(GTTableComponent,{static:false}) tablaTipos: GTTableComponent;
  @ViewChild(MatPaginator,{static:true}) paginator: MatPaginator;
  constructor(private tipoProductoService: TipoProductoService,
    private matDialog: MatDialog,
    private formService: GFFormService ){
    }
    
    ngAfterViewInit(){
      
    }
    ngOnInit(){
      this.getTipoProductoPlist();
      this.formTipo.APIRequest.edition = this.peticionUpdate
      this.formTipo.APIRequest.creation = this.peticionCreate
      this.FormSearch = new FormGroup({
        search: new FormControl(null),
      });
      this.FormSearch.get('search').valueChanges.subscribe(valor=>{
        this.lastsearch = valor
        this.paginator.firstPage()
        if(this.paginator.pageIndex === 0){
          this.getTiposPaginado() 
        }
        
      })
    }

    getOne(tipoProducto: TipoProducto){
    this.formTipo.changeTypeForm(tipoProducto, GF_TypeForm.INSPECTION, "View Tipo Producto")
    //Por definición un observable necesita que alguien se suscriba para ejecutarse y hay veces que no necesitas hacer anda con la respuesta
    this.formService.openForm(this.formTipo).subscribe();

  }
  /**
   * 
   * @param tipoProducto 
   */
  edit(tipoProducto: TipoProducto){
    this.formTipo.changeTypeForm(tipoProducto, GF_TypeForm.EDITION, "Editar Tipo Producto")
    this.formTipo.disableControls(['id'])
    this.formService.openForm(this.formTipo).subscribe(tipoUpdate=>{
      if(tipoUpdate){
        this.getTipoProductoPlist()
      }
    });
  }

  delete(tipoProducto: TipoProducto){
    this.tipoProductoService.delete(tipoProducto.id).subscribe(()=>{
      console.log("borrado")
      this.getTipoProductoPlist();
    })
  }

  create(){
    this.formTipo.changeTypeForm(null, GF_TypeForm.CREATION, "Crear Tipo Producto")
    this.formTipo.disableControls(['id']) 
    this.formService.openForm(this.formTipo).subscribe(tipoUpdate=>{
      if(tipoUpdate){
        this.getTipoProductoPlist()
      }
    });
  }


  getTipoProductoPlist(){
    this.tipoProductoService.getTipoProductoPlist().subscribe(productos=>{
      this.listadoTipoProducto = productos.content
      this.totalTipoProductos = productos.totalElements
      if(this.tablaTipos){
        this.tablaTipos.refrescaTabla(this.listadoTipoProducto)
      }
    })
  }

  notification(event: {accion:string, elemento:TipoProducto}){
    switch(event.accion){
      case 'editar':
        this.edit(event.elemento)
      break;
      case 'eliminarT':
        this.delete(event.elemento)
      break;
      case 'ver':
        this.getOne(event.elemento)
        break;
    }
  }

  pagina(page: PageEvent){
    this.lastpage = page
    this.getTiposPaginado()
  }

  getTiposPaginado(){
    this.tipoProductoService.getTipoProductoPlist(this.lastpage?.pageIndex, this.lastpage?.pageSize, this.lastsearch).subscribe(tipoProducto =>{
      this.tablaTipos.refrescaTabla(tipoProducto.content)
      this.totalTipoProductos = tipoProducto.totalElements
    })
  }

  ordenar(ordenacion: any){
    console.log(ordenacion)
  }

  generate(){
    this.tipoProductoService.generate().subscribe(tipoProducto=>{
      this.getTiposPaginado()
    })
  }
}
