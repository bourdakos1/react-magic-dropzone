import React from 'react'
import { mount, render } from 'enzyme'
import { configure } from 'enzyme'
import { spy, stub } from 'sinon'
import Adapter from 'enzyme-adapter-react-16'

import MagicDropzone from '../MagicDropzone'
import { onDocumentDragOver } from '../utils'

configure({ adapter: new Adapter() })

const DummyChildComponent = () => null

global.window.URL = {
  createObjectURL: function createObjectURL(arg) {
    return 'data://' + arg.name
  }
}

let files
let images
let testLinks

describe('MagicDropzone', () => {
  beforeEach(() => {
    testLinks = {
      image1: 'https://image.jpg',
      json: 'http://test.json',
      html: '<img class="  --" sizes="50vw" srcset="https://images.fastcompany.net/image/upload/w_707,ar_16:9,c_limit,f_auto,q_auto:best,fl_lossy/wp-cms/uploads/2017/06/p-1-sonic-burger.jpg 707w" alt="The Newest Burger At Sonic Blends The Beef With Mushrooms So You Eat Less Meat">',
      html2: '<html><img src="https://fun.jpg"><div>tests are fun</div><img src="https://fun2.json"></html>'
    }

    files = [
      {
        name: 'file1.pdf',
        size: 1111,
        type: 'application/pdf'
      }
    ]

    images = [
      {
        name: 'cats.gif',
        size: 1234,
        type: 'image/gif'
      },
      {
        name: 'dogs.jpg',
        size: 2345,
        type: 'image/jpeg'
      }
    ]
  })

  describe('basics', () => {
    it('should render children', () => {
      const dropzone = mount(
        <MagicDropzone>
          <p>some content</p>
        </MagicDropzone>
      )
      expect(dropzone.html()).toMatchSnapshot()
    })

    it('should render an input HTML element', () => {
      const dropzone = mount(
        <MagicDropzone>
          <p>some content</p>
        </MagicDropzone>
      )
      expect(dropzone.find('input').length).toEqual(1)
    })

    it('sets ref properly', () => {
      const dropzone = mount(<MagicDropzone />)
      expect(dropzone.instance().fileInputEl).not.toBeUndefined()
      expect(dropzone.instance().fileInputEl.tagName).toEqual('INPUT')
    })

    it('applies the accept prop to the child input', () => {
      const component = render(<MagicDropzone accept="image/jpeg" />)
      expect(Object.keys(component.find('input').attr())).toContain('accept')
      expect(component.find('input').attr('accept')).toEqual('image/jpeg')
    })
  })

  describe('document drop protection', () => {
    let dropzone
    let addEventCalls
    let savedAddEventListener
    let savedRemoveEventListener

    beforeEach(() => {
      savedAddEventListener = document.addEventListener
      savedRemoveEventListener = document.removeEventListener
      document.addEventListener = spy()
      document.removeEventListener = spy()
    })

    afterEach(() => {
      document.addEventListener = savedAddEventListener
      document.removeEventListener = savedRemoveEventListener
    })

    // Collect the list of addEventListener/removeEventListener spy calls into an object keyed by event name.
    function collectEventListenerCalls(calls) {
      return calls.reduce((acc, [eventName, ...rest]) => {
        acc[eventName] = rest
        return acc
      }, {})
    }

    it('installs hooks to prevent stray drops from taking over the browser window', () => {
      dropzone = mount(
        <MagicDropzone>
          <p>Content</p>
        </MagicDropzone>
      )
      expect(dropzone.html()).toMatchSnapshot()
      expect(document.addEventListener.callCount).toEqual(2)
      addEventCalls = collectEventListenerCalls(document.addEventListener.args)
      Object.keys(addEventCalls).forEach(eventName => {
        expect(addEventCalls[eventName][0]).toBeDefined()
        expect(addEventCalls[eventName][1]).toBe(false)
      })
    })

    it('terminates drags and drops on elements outside our dropzone', () => {
      const div = document.createElement('div')
      const event = { preventDefault: spy(), target: div }
      onDocumentDragOver(event)
      expect(event.preventDefault.callCount).toEqual(1)
      event.preventDefault.reset()

      dropzone.instance().onDocumentDrop(event)
      expect(event.preventDefault.callCount).toEqual(1)
    })

    it('terminates drags and drops on text input elements outside our dropzone', () => {
      const input = document.createElement('input')
      input.setAttribute('type', 'text')
      const event = { preventDefault: spy(), target: input }
      onDocumentDragOver(event)
      expect(event.preventDefault.callCount).toEqual(1)
      event.preventDefault.reset()

      dropzone.instance().onDocumentDrop(event)
      expect(event.preventDefault.callCount).toEqual(1)
    })

    it('permits drags and drops on elements inside our dropzone', () => {
      const instanceEvent = {
        preventDefault: spy(),
        target: dropzone.getDOMNode()
      }
      dropzone.instance().onDocumentDrop(instanceEvent)
      expect(instanceEvent.preventDefault.callCount).toEqual(0)
    })

    it('removes document hooks when unmounted', () => {
      dropzone.unmount()
      expect(document.removeEventListener.callCount).toEqual(2)
      const removeEventCalls = collectEventListenerCalls(
        document.removeEventListener.args
      )
      Object.keys(addEventCalls).forEach(eventName => {
        expect(removeEventCalls[eventName][0]).toEqual(
          addEventCalls[eventName][0]
        )
      })
    })

    it('does not prevent stray drops when preventDropOnDocument is false', () => {
      dropzone = mount(<MagicDropzone preventDropOnDocument={false} />)
      expect(dropzone.html()).toMatchSnapshot()
      expect(document.addEventListener.callCount).toEqual(0)

      dropzone.unmount()
      expect(document.removeEventListener.callCount).toEqual(0)
    })
  })

  describe('onClick', () => {
    it('should call `open` method', done => {
      const dropzone = mount(<MagicDropzone />)
      spy(dropzone.instance(), 'open')
      dropzone.simulate('click')
      setTimeout(() => {
        expect(dropzone.instance().open.callCount).toEqual(1)
        done()
      }, 0)
    })

    it('should not call `open` if disableClick prop is true', () => {
      const dropzone = mount(<MagicDropzone disableClick />)
      spy(dropzone.instance(), 'open')
      dropzone.simulate('click')
      expect(dropzone.instance().open.callCount).toEqual(0)
    })

    it('should call `onClick` callback if provided', done => {
      const clickSpy = spy()
      const dropzone = mount(<MagicDropzone onClick={clickSpy} />)
      spy(dropzone.instance(), 'open')
      dropzone.simulate('click')
      setTimeout(() => {
        expect(dropzone.instance().open.callCount).toEqual(1)
        expect(clickSpy.callCount).toEqual(1)
        done()
      }, 0)
    })

    it('should reset the value of input', () => {
      const dropzone = mount(<MagicDropzone />)
      expect(
        dropzone
          .render()
          .find('input')
          .attr('value')
      ).toBeUndefined()
      expect(
        dropzone
          .render()
          .find('input')
          .attr('value', 10)
      ).not.toBeUndefined()
      dropzone.simulate('click')
      expect(
        dropzone
          .render()
          .find('input')
          .attr('value')
      ).toBeUndefined()
    })

    it('should trigger click even on the input', done => {
      const dropzone = mount(<MagicDropzone />)
      const clickSpy = spy(dropzone.instance().fileInputEl, 'click')
      dropzone.simulate('click')
      dropzone.simulate('click')
      setTimeout(() => {
        expect(clickSpy.callCount).toEqual(2)
        done()
      }, 0)
    })

    it('should not invoke onClick on the wrapper', () => {
      const onClickOuterSpy = spy()
      const onClickInnerSpy = spy()
      const component = mount(
        <div onClick={onClickOuterSpy}>
          <MagicDropzone onClick={onClickInnerSpy} />
        </div>
      )

      component.simulate('click')
      expect(onClickOuterSpy.callCount).toEqual(1)
      expect(onClickInnerSpy.callCount).toEqual(0)

      onClickOuterSpy.reset()
      onClickInnerSpy.reset()

      component.find('MagicDropzone').simulate('click')
      expect(onClickOuterSpy.callCount).toEqual(0)
      expect(onClickInnerSpy.callCount).toEqual(1)
    })

    it('should invoke onClick on the wrapper if disableClick is set', () => {
      const onClickOuterSpy = spy()
      const component = mount(
        <div onClick={onClickOuterSpy}>
          <MagicDropzone disableClick />
        </div>
      )

      component.find('MagicDropzone').simulate('click')
      expect(onClickOuterSpy.callCount).toEqual(1)
    })

    it('should invoke inputProps onClick if provided', done => {
      const inputPropsClickSpy = spy()
      const component = mount(
        <MagicDropzone inputProps={{ onClick: inputPropsClickSpy }} />
      )

      component.find('MagicDropzone').simulate('click')
      setTimeout(() => {
        expect(inputPropsClickSpy.callCount).toEqual(1)
        done()
      }, 0)
    })
  })

  describe('drag-n-drop', () => {
    it('should override onDrag* methods', () => {
      const dragStartSpy = spy()
      const dragEnterSpy = spy()
      const dragOverSpy = spy()
      const dragLeaveSpy = spy()
      const component = mount(
        <MagicDropzone
          onDragStart={dragStartSpy}
          onDragEnter={dragEnterSpy}
          onDragOver={dragOverSpy}
          onDragLeave={dragLeaveSpy}
        />
      )
      component.simulate('dragStart')
      component.simulate('dragEnter', { dataTransfer: { types: ['Files'], items: files } })
      component.simulate('dragOver', { dataTransfer: { types: ['Files'], items: files } })
      component.simulate('dragLeave', { dataTransfer: { types: ['Files'], items: files } })
      expect(dragStartSpy.callCount).toEqual(1)
      expect(dragEnterSpy.callCount).toEqual(1)
      expect(dragOverSpy.callCount).toEqual(1)
      expect(dragLeaveSpy.callCount).toEqual(1)
    })

    it('should guard dropEffect in onDragOver for IE', () => {
      const dragStartSpy = spy()
      const dragEnterSpy = spy()
      const dragLeaveSpy = spy()
      const component = mount(
        <MagicDropzone
          onDragStart={dragStartSpy}
          onDragEnter={dragEnterSpy}
          onDragLeave={dragLeaveSpy}
        />
      )

      // Using Proxy we'll emulate IE throwing when setting dataTransfer.dropEffect
      const eventProxy = new Proxy(
        {},
        {
          get: (target, prop) => {
            switch (prop) {
              case 'dataTransfer':
                throw new Error('IE does not support rrror')
              default:
                return function noop() {}
            }
          }
        }
      )

      // And using then we'll call the onDragOver with the proxy instead of event
      const dragOverSpy = stub(component.instance(), 'onDragOver').callsFake(
        component.instance().onDragOver(eventProxy)
      )

      component.simulate('dragStart', { dataTransfer: { types: ['Files'], items: files } })
      component.simulate('dragEnter', { dataTransfer: { types: ['Files'], items: files } })
      component.simulate('dragOver', { dataTransfer: { types: ['Files'], items: files } })
      component.simulate('dragLeave', { dataTransfer: { types: ['Files'], items: files } })
      expect(dragStartSpy.callCount).toEqual(1)
      expect(dragEnterSpy.callCount).toEqual(1)
      expect(dragLeaveSpy.callCount).toEqual(1)
      // It should not throw the error
      expect(dragOverSpy).not.toThrow()
      dragOverSpy.restore()
    })
  })

  describe('onDrop', () => {
    let dropSpy
    let dropAcceptedSpy
    let dropRejectedSpy

    beforeEach(() => {
      dropSpy = spy()
      dropAcceptedSpy = spy()
      dropRejectedSpy = spy()
    })

    afterEach(() => {
      dropSpy.reset()
      dropAcceptedSpy.reset()
      dropRejectedSpy.reset()
    })

    it('should add valid files to rejected files on a multple drop when multiple false', () => {
      const dropzone = mount(
        <MagicDropzone accept="image/*" onDrop={dropSpy} multiple={false} />
      )
      dropzone.simulate('drop', { dataTransfer: { types: ['Files'], files: images } })
      const rejected = dropSpy.firstCall.args[0]
      expect(rejected.length).toEqual(1)
    })

    it('should add invalid files to rejected when multiple is false', () => {
      const dropzone = mount(
        <MagicDropzone accept="image/*" onDrop={dropSpy} multiple={false} />
      )
      dropzone.simulate('drop', {
        dataTransfer: { types: ['Files'], files: images.concat(files) }
      })
      const rejected = dropSpy.firstCall.args[1]
      expect(rejected.length).toEqual(2)
    })

    it('should allow single files to be dropped if multiple is false', () => {
      const dropzone = mount(
        <MagicDropzone accept="image/*" onDrop={dropSpy} multiple={false} />
      )

      dropzone.simulate('drop', { dataTransfer: { types: ['Files'], files: [images[0]] } })
      const [accepted, rejected] = dropSpy.firstCall.args
      expect(accepted.length).toEqual(1)
      expect(rejected.length).toEqual(0)
    })

    it('should take all dropped files if multiple is true', () => {
      const dropzone = mount(<MagicDropzone onDrop={dropSpy} multiple />)
      dropzone.simulate('drop', { dataTransfer: { types: ['Files'], files: images } })
      expect(dropSpy.firstCall.args[0]).toHaveLength(2)
      expect(dropSpy.firstCall.args[0][0].name).toEqual(images[0].name)
      expect(dropSpy.firstCall.args[0][1].name).toEqual(images[1].name)
    })

    it('should set this.isFileDialogActive to false', () => {
      const dropzone = mount(<MagicDropzone />)
      dropzone.instance().isFileDialogActive = true
      dropzone.simulate('drop', { dataTransfer: { types: ['Files'], files } })
      expect(dropzone.instance().isFileDialogActive).toEqual(false)
    })

    it('should always call onDrop callback with accepted and rejected arguments', () => {
      const dropzone = mount(
        <MagicDropzone
          onDrop={dropSpy}
          onDropAccepted={dropAcceptedSpy}
          onDropRejected={dropRejectedSpy}
          accept="image/*"
        />
      )
      dropzone.simulate('drop', { dataTransfer: { types: ['Files'], files } })
      expect(dropSpy.callCount).toEqual(1)
      expect(dropSpy.firstCall.args[0]).toEqual([], [...files])
      dropzone.simulate('drop', { dataTransfer: { types: ['Files'], files: images } })
      expect(dropSpy.callCount).toEqual(2)
      expect(dropSpy.lastCall.args[0]).toEqual([...images], [])
      dropzone.simulate('drop', {
        dataTransfer: { types: ['Files'], files: files.concat(images) }
      })
      expect(dropSpy.callCount).toEqual(3)
      expect(dropSpy.lastCall.args[0]).toEqual([...images], [...files])
    })

    it('should call onDropAccepted callback if some files were accepted', () => {
      const dropzone = mount(
        <MagicDropzone
          onDrop={dropSpy}
          onDropAccepted={dropAcceptedSpy}
          onDropRejected={dropRejectedSpy}
          accept="image/*"
        />
      )
      dropzone.simulate('drop', { dataTransfer: { types: ['Files'], files } })
      expect(dropAcceptedSpy.callCount).toEqual(0)
      dropzone.simulate('drop', { dataTransfer: { types: ['Files'], files: images } })
      expect(dropAcceptedSpy.callCount).toEqual(1)
      expect(dropAcceptedSpy.lastCall.args[0]).toEqual([...images])
      dropzone.simulate('drop', {
        dataTransfer: { types: ['Files'], files: files.concat(images) }
      })
      expect(dropAcceptedSpy.callCount).toEqual(2)
      expect(dropAcceptedSpy.lastCall.args[0]).toEqual([...images])
    })

    it('should call onDropRejected callback if some files were rejected', () => {
      const dropzone = mount(
        <MagicDropzone
          onDrop={dropSpy}
          onDropAccepted={dropAcceptedSpy}
          onDropRejected={dropRejectedSpy}
          accept="image/*"
        />
      )
      dropzone.simulate('drop', { dataTransfer: { types: ['Files'], files } })
      expect(dropRejectedSpy.callCount).toEqual(1)
      expect(dropRejectedSpy.lastCall.args[0]).toEqual([...files])
      dropzone.simulate('drop', { dataTransfer: { types: ['Files'], files: images } })
      expect(dropRejectedSpy.callCount).toEqual(1)
      dropzone.simulate('drop', {
        dataTransfer: { types: ['Files'], files: files.concat(images) }
      })
      expect(dropRejectedSpy.callCount).toEqual(2)
      expect(dropRejectedSpy.lastCall.args[0]).toEqual([...files])
    })

    it('applies the accept prop to the dropped files', () => {
      const dropzone = mount(
        <MagicDropzone
          onDrop={dropSpy}
          onDropAccepted={dropAcceptedSpy}
          onDropRejected={dropRejectedSpy}
          accept="image/*"
        />
      )
      dropzone.simulate('drop', { dataTransfer: { types: ['Files'], files } })
      expect(dropSpy.callCount).toEqual(1)
      expect(dropSpy.firstCall.args[0]).toHaveLength(0)
      expect(dropSpy.firstCall.args[1]).toHaveLength(1)
      expect(dropAcceptedSpy.callCount).toEqual(0)
      expect(dropRejectedSpy.callCount).toEqual(1)
      expect(dropRejectedSpy.firstCall.args[0]).toHaveLength(1)
    })

    it('applies the accept prop to the dropped images', () => {
      const dropzone = mount(
        <MagicDropzone
          onDrop={dropSpy}
          onDropAccepted={dropAcceptedSpy}
          onDropRejected={dropRejectedSpy}
          accept="image/*"
        />
      )

      dropzone.simulate('drop', { dataTransfer: { types: ['Files'], files: images } })
      expect(dropSpy.callCount).toEqual(1)
      expect(dropSpy.firstCall.args[0]).toHaveLength(2)
      expect(dropSpy.firstCall.args[1]).toHaveLength(0)
      expect(dropAcceptedSpy.callCount).toEqual(1)
      expect(dropAcceptedSpy.firstCall.args[0]).toHaveLength(2)
      expect(dropRejectedSpy.callCount).toEqual(0)
    })

    it('accepts a dropped image when Firefox provides a bogus file type', () => {
      const dropzone = mount(
        <MagicDropzone
          onDrop={dropSpy}
          onDropAccepted={dropAcceptedSpy}
          onDropRejected={dropRejectedSpy}
          accept="image/*"
        />
      )
      const bogusImages = [
        {
          name: 'bogus.gif',
          size: 1234,
          type: 'application/x-moz-file'
        }
      ]

      dropzone.simulate('drop', { dataTransfer: { types: ['Files'], files: bogusImages } })
      expect(dropSpy.callCount).toEqual(1)
      expect(dropSpy.firstCall.args[0]).toHaveLength(1)
      expect(dropSpy.firstCall.args[1]).toHaveLength(0)
      expect(dropAcceptedSpy.callCount).toEqual(1)
      expect(dropAcceptedSpy.firstCall.args[0]).toHaveLength(1)
      expect(dropRejectedSpy.callCount).toEqual(0)
    })

    it('accepts all dropped files and images when no accept prop is specified', () => {
      const dropzone = mount(
        <MagicDropzone
          onDrop={dropSpy}
          onDropAccepted={dropAcceptedSpy}
          onDropRejected={dropRejectedSpy}
        />
      )
      dropzone.simulate('drop', {
        dataTransfer: { types: ['Files'], files: files.concat(images) }
      })
      expect(dropSpy.callCount).toEqual(1)
      expect(dropSpy.firstCall.args[0]).toHaveLength(3)
      expect(dropSpy.firstCall.args[1]).toHaveLength(0)
      expect(dropAcceptedSpy.callCount).toEqual(1)
      expect(dropAcceptedSpy.firstCall.args[0]).toHaveLength(3)
      expect(dropRejectedSpy.callCount).toEqual(0)
    })

    it('applies the maxSize prop to the dropped files', () => {
      const dropzone = mount(
        <MagicDropzone
          onDrop={dropSpy}
          onDropAccepted={dropAcceptedSpy}
          onDropRejected={dropRejectedSpy}
          maxSize={1111}
        />
      )

      dropzone.simulate('drop', { dataTransfer: { types: ['Files'], files } })
      expect(dropSpy.callCount).toEqual(1)
      expect(dropSpy.firstCall.args[0]).toHaveLength(1)
      expect(dropSpy.firstCall.args[1]).toHaveLength(0)
      expect(dropAcceptedSpy.callCount).toEqual(1)
      expect(dropAcceptedSpy.firstCall.args[0]).toHaveLength(1)
      expect(dropRejectedSpy.callCount).toEqual(0)
    })

    it('applies the maxSize prop to the dropped images', () => {
      const dropzone = mount(
        <MagicDropzone
          onDrop={dropSpy}
          onDropAccepted={dropAcceptedSpy}
          onDropRejected={dropRejectedSpy}
          maxSize={1111}
        />
      )
      dropzone.simulate('drop', { dataTransfer: { types: ['Files'], files: images } })
      expect(dropSpy.callCount).toEqual(1)
      expect(dropSpy.firstCall.args[0]).toHaveLength(0)
      expect(dropSpy.firstCall.args[1]).toHaveLength(2)
      expect(dropAcceptedSpy.callCount).toEqual(0)
      expect(dropRejectedSpy.callCount).toEqual(1)
      expect(dropRejectedSpy.firstCall.args[0]).toHaveLength(2)
    })

    it('applies the minSize prop to the dropped files', () => {
      const dropzone = mount(
        <MagicDropzone
          onDrop={dropSpy}
          onDropAccepted={dropAcceptedSpy}
          onDropRejected={dropRejectedSpy}
          minSize={1112}
        />
      )
      dropzone.simulate('drop', { dataTransfer: { types: ['Files'], files } })
      expect(dropSpy.callCount).toEqual(1)
      expect(dropSpy.firstCall.args[0]).toHaveLength(0)
      expect(dropSpy.firstCall.args[1]).toHaveLength(1)
      expect(dropAcceptedSpy.callCount).toEqual(0)
      expect(dropRejectedSpy.callCount).toEqual(1)
      expect(dropRejectedSpy.firstCall.args[0]).toHaveLength(1)
    })

    it('applies the minSize prop to the dropped images', () => {
      const dropzone = mount(
        <MagicDropzone
          onDrop={dropSpy}
          onDropAccepted={dropAcceptedSpy}
          onDropRejected={dropRejectedSpy}
          minSize={1112}
        />
      )
      dropzone.simulate('drop', { dataTransfer: { types: ['Files'], files: images } })
      expect(dropSpy.callCount).toEqual(1)
      expect(dropSpy.firstCall.args[0]).toHaveLength(2)
      expect(dropSpy.firstCall.args[1]).toHaveLength(0)
      expect(dropAcceptedSpy.callCount).toEqual(1)
      expect(dropAcceptedSpy.firstCall.args[0]).toHaveLength(2)
      expect(dropRejectedSpy.callCount).toEqual(0)
    })

    it('accepts all dropped files and images when no size prop is specified', () => {
      const dropzone = mount(
        <MagicDropzone
          onDrop={dropSpy}
          onDropAccepted={dropAcceptedSpy}
          onDropRejected={dropRejectedSpy}
        />
      )
      dropzone.simulate('drop', {
        dataTransfer: { types: ['Files'], files: files.concat(images) }
      })
      expect(dropSpy.callCount).toEqual(1)
      expect(dropSpy.firstCall.args[0]).toHaveLength(3)
      expect(dropSpy.firstCall.args[1]).toHaveLength(0)
      expect(dropAcceptedSpy.callCount).toEqual(1)
      expect(dropAcceptedSpy.firstCall.args[0]).toHaveLength(3)
      expect(dropRejectedSpy.callCount).toEqual(0)
    })
  })

  describe('preview', () => {
    it('should generate previews for non-images', () => {
      const dropSpy = spy()
      const dropzone = mount(<MagicDropzone onDrop={dropSpy} />)
      dropzone.simulate('drop', { dataTransfer: { types: ['Files'], files } })
      expect(Object.keys(dropSpy.firstCall.args[0][0])).toContain('preview')
      expect(dropSpy.firstCall.args[0][0].preview).toContain('data://file1.pdf')
    })

    it('should generate previews for images', () => {
      const dropSpy = spy()
      const dropzone = mount(<MagicDropzone onDrop={dropSpy} />)
      dropzone.simulate('drop', { dataTransfer: { types: ['Files'], files: images } })
      expect(Object.keys(dropSpy.firstCall.args[0][0])).toContain('preview')
      expect(dropSpy.firstCall.args[0][0].preview).toContain('data://cats.gif')
    })

    it('should not throw error when preview cannot be created', () => {
      const dropSpy = spy()
      const dropzone = mount(<MagicDropzone onDrop={dropSpy} />)

      dropzone.simulate('drop', { dataTransfer: { types: ['Files'], files: ['bad_val'] } })

      expect(Object.keys(dropSpy.firstCall.args[1][0])).not.toContain('preview')
    })

    it('should not generate previews if disablePreview is true', () => {
      const dropSpy = spy()
      const dropzone = mount(<MagicDropzone disablePreview onDrop={dropSpy} />)
      dropzone.simulate('drop', { dataTransfer: { types: ['Files'], files: images } })
      dropzone.simulate('drop', { dataTransfer: { types: ['Files'], files } })
      expect(dropSpy.callCount).toEqual(2)
      expect(Object.keys(dropSpy.firstCall.args[0][0])).not.toContain('preview')
      expect(Object.keys(dropSpy.lastCall.args[0][0])).not.toContain('preview')
    })
  })

  describe('onDrop links', () => {
    let dropSpy
    let dropAcceptedSpy
    let dropRejectedSpy

    beforeEach(() => {
      dropSpy = spy()
      dropAcceptedSpy = spy()
      dropRejectedSpy = spy()
    })

    afterEach(() => {
      dropSpy.reset()
      dropAcceptedSpy.reset()
      dropRejectedSpy.reset()
    })

    it('should allow text/uri-list to be dropped', () => {
      const dropzone = mount(
        <MagicDropzone
          accept=".jpg"
          onDrop={dropSpy}
        />
      )

      dropzone.simulate('drop', {
        dataTransfer: {
          types: ['text/uri-list'],
          getData: function() {
            return testLinks.image1
          }
        }
      })
      const [accepted, rejected, links] = dropSpy.firstCall.args
      expect(accepted.length).toEqual(0)
      expect(rejected.length).toEqual(0)
      expect(links.length).toEqual(1)
    })

    it('should return an empty list if text/uri-list is dropped with no accept', () => {
      const dropzone = mount(
        <MagicDropzone
          onDrop={dropSpy}
        />
      )

      dropzone.simulate('drop', {
        dataTransfer: {
          types: ['text/uri-list'],
          getData: function() {
            return testLinks.image1
          }
        }
      })
      const [accepted, rejected, links] = dropSpy.firstCall.args
      expect(accepted.length).toEqual(0)
      expect(rejected.length).toEqual(0)
      expect(links.length).toEqual(0)
    })

    it('should allow for muliple links to be dropped', () => {
      const dropzone = mount(
        <MagicDropzone
          accept=".jpg, .json"
          onDrop={dropSpy}
        />
      )

      dropzone.simulate('drop', {
        dataTransfer: {
          types: ['text/uri-list'],
          getData: function() {
            return testLinks.html2
          }
        }
      })
      const [accepted, rejected, links] = dropSpy.firstCall.args
      expect(accepted.length).toEqual(0)
      expect(rejected.length).toEqual(0)
      expect(links.length).toEqual(2)
    })

    it('should allow text/html to be dropped', () => {
      const dropzone = mount(
        <MagicDropzone
          accept=".jpg"
          onDrop={dropSpy}
        />
      )

      dropzone.simulate('drop', {
        dataTransfer: {
          types: ['text/html'],
          getData: function() {
            return testLinks.html
          }
        }
      })
      const [accepted, rejected, links] = dropSpy.firstCall.args
      expect(accepted.length).toEqual(0)
      expect(rejected.length).toEqual(0)
      expect(links.length).toEqual(1)
    })

    it('should only allow links of valid extension', () => {
      const dropzone = mount(
        <MagicDropzone
          accept=".jpg"
          onDrop={dropSpy}
          multiple={false}
        />
      )

      dropzone.simulate('drop', {
        dataTransfer: {
          types: ['text/uri-list'],
          getData: function() {
            return testLinks.json
          }
        }
      })
      const [accepted, rejected, links] = dropSpy.firstCall.args
      expect(accepted.length).toEqual(0)
      expect(rejected.length).toEqual(0)
      expect(links.length).toEqual(0)
    })
  })

  describe('onCancel', () => {
    it('should not invoke onFileDialogCancel everytime window receives focus', done => {
      const onCancelSpy = spy()
      mount(
        <MagicDropzone
          id="on-cancel-example"
          onFileDialogCancel={onCancelSpy}
        />
      )
      // Simulated DOM event - onfocus
      document.body.addEventListener('focus', () => {})
      const evt = document.createEvent('HTMLEvents')
      evt.initEvent('focus', false, true)
      document.body.dispatchEvent(evt)
      // setTimeout to match the event callback from actual Component
      setTimeout(() => {
        expect(onCancelSpy.callCount).toEqual(0)
        done()
      }, 300)
    })

    it('should invoke onFileDialogCancel when window receives focus via cancel button', done => {
      const onCancelSpy = spy()
      const component = mount(
        <MagicDropzone
          className="dropzone-content"
          onFileDialogCancel={onCancelSpy}
        />
      )

      // Test / invoke the click event
      spy(component.instance(), 'open')
      component.simulate('click')

      setTimeout(() => {
        expect(component.instance().open.callCount).toEqual(1)

        // Simulated DOM event - onfocus
        document.body.addEventListener('focus', () => {})
        const evt = document.createEvent('HTMLEvents')
        evt.initEvent('focus', false, true)
        document.body.dispatchEvent(evt)

        // setTimeout to match the event callback from actual Component
        setTimeout(() => {
          expect(onCancelSpy.callCount).toEqual(1)
          done()
        }, 300)
      }, 0)
    })
  })

  describe('nested MagicDropzone component behavior', () => {
    let outerMagicDropzone
    let innerMagicDropzone
    let outerDropSpy
    let outerDropAcceptedSpy
    let outerDropRejectedSpy
    let innerDropSpy
    let innerDropAcceptedSpy
    let innerDropRejectedSpy

    const InnerDragAccepted = () => <p>Accepted</p>
    const InnerDragRejected = () => <p>Rejected</p>
    const InnerMagicDropzone = () => (
      <MagicDropzone
        onDrop={innerDropSpy}
        onDropAccepted={innerDropAcceptedSpy}
        onDropRejected={innerDropRejectedSpy}
        accept="image/*"
      >
        {({ isDragActive, isDragReject }) => {
          if (isDragReject) return <InnerDragRejected />
          if (isDragActive) return <InnerDragAccepted />
          return <p>No drag</p>
        }}
      </MagicDropzone>
    )

    describe('dropping on the inner dropzone', () => {
      it('mounts both dropzones', () => {
        outerDropSpy = spy()
        outerDropAcceptedSpy = spy()
        outerDropRejectedSpy = spy()
        innerDropSpy = spy()
        innerDropAcceptedSpy = spy()
        innerDropRejectedSpy = spy()
        outerMagicDropzone = mount(
          <MagicDropzone
            onDrop={outerDropSpy}
            onDropAccepted={outerDropAcceptedSpy}
            onDropRejected={outerDropRejectedSpy}
            accept="image/*"
          >
            {props => <InnerMagicDropzone {...props} />}
          </MagicDropzone>
        )
        innerMagicDropzone = outerMagicDropzone.find(InnerMagicDropzone)
      })

      //   it('does dragEnter on both dropzones', () => {
      //     innerMagicDropzone.simulate('dragEnter', {
      //       dataTransfer: { files: images }
      //     })
      //     expect(innerMagicDropzone).toHaveProp('isDragActive', true)
      //     expect(innerMagicDropzone).toHaveProp('isDragReject', false)
      //     expect(innerMagicDropzone.find(InnerDragAccepted).exists()).toEqual(
      //       true
      //     )
      //     expect(innerMagicDropzone.find(InnerDragRejected).exists()).toEqual(
      //       false
      //     )
      //   })
      //
      //   it('drops on the child dropzone', () => {
      //     innerMagicDropzone.simulate('drop', {
      //       dataTransfer: { files: files.concat(images) }
      //     })
      //   })
      //
      //   it('accepts the drop on the inner dropzone', () => {
      //     expect(innerDropSpy.callCount).toEqual(1)
      //     expect(innerDropSpy.firstCall.args[0]).toHaveLength(2)
      //     expect(innerDropSpy.firstCall.args[1]).toHaveLength(1)
      //     expect(innerDropAcceptedSpy.callCount).toEqual(1)
      //     expect(innerDropAcceptedSpy.firstCall.args[0]).toHaveLength(2)
      //     expect(innerDropRejectedSpy.callCount).toEqual(1)
      //     expect(innerDropRejectedSpy.firstCall.args[0]).toHaveLength(1)
      //     expect(innerMagicDropzone.find(InnerDragAccepted).exists()).toEqual(
      //       false
      //     )
      //     expect(innerMagicDropzone.find(InnerDragRejected).exists()).toEqual(
      //       false
      //     )
      //   })
      //
      //   it('also accepts the drop on the outer dropzone', () => {
      //     expect(outerDropSpy.callCount).toEqual(1)
      //     expect(outerDropSpy.firstCall.args[0]).toHaveLength(2)
      //     expect(outerDropSpy.firstCall.args[1]).toHaveLength(1)
      //     expect(outerDropAcceptedSpy.callCount).toEqual(1)
      //     expect(outerDropAcceptedSpy.firstCall.args[0]).toHaveLength(2)
      //     expect(outerDropRejectedSpy.callCount).toEqual(1)
      //     expect(outerDropRejectedSpy.firstCall.args[0]).toHaveLength(1)
      //     expect(innerMagicDropzone).toHaveProp('isDragActive', false)
      //     expect(innerMagicDropzone).toHaveProp('isDragReject', false)
      //   })
    })
  })

  describe('behavior', () => {
    it('does not throw an error when html is dropped instead of files and multiple is false', () => {
      const dropzone = mount(<MagicDropzone multiple={false} />)

      const fn = () =>
        dropzone.simulate('drop', { dataTransfer: { types: ['Files'], files: [] } })
      expect(fn).not.toThrow()
    })

    it('does not allow actions when disabled props is true', done => {
      const dropzone = mount(<MagicDropzone disabled />)

      spy(dropzone.instance(), 'open')
      dropzone.simulate('click')
      setTimeout(() => {
        expect(dropzone.instance().open.callCount).toEqual(0)
        done()
      }, 0)
    })

    it('when toggle disabled props, MagicDropzone works as expected', done => {
      const dropzone = mount(<MagicDropzone disabled />)
      spy(dropzone.instance(), 'open')

      dropzone.setProps({ disabled: false })

      dropzone.simulate('click')
      setTimeout(() => {
        expect(dropzone.instance().open.callCount).toEqual(1)
        done()
      }, 0)
    })
  })
})
